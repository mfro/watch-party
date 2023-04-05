import { IncomingMessage } from 'http';
import WebSocket from 'ws';

import { Event } from 'watch-party';
import { performance } from 'perf_hooks';

const port = parseInt(process.argv[2]);
const server = new WebSocket.Server({
  port,
  perMessageDeflate: true,
});

const rooms = new Map<string, Room>();
server.on('connection', async (ws, request) => {
  try {
    const params = get_params(request);
    const name = params.name;

    let room;
    if (name && rooms.has(name)) {
      room = rooms.get(name)!;
    } else {
      room = new Room();
      rooms.set(room.name, room);
      ws.send(JSON.stringify([0, { name: room.name }]));
    }

    room.connect(ws);
  } catch (e) {
    console.log(e);
    ws.close();
    return;
  }
});

class Room {
  name: string;
  state: null | {
    url: string,
    play: boolean,
    time: number,
  };

  last_update: number = 0;
  clients: WebSocket[] = [];

  constructor() {
    this.name = random_id();
    this.state = null;
  }

  update() {
    const now = performance.now();

    if (this.state?.play) {
      const offset = (now - this.last_update) / 1000;
      this.state.time += offset;
    }

    this.last_update = now;
  }

  connect(ws: WebSocket) {
    this.update();

    if (this.state) {
      ws.send(JSON.stringify([1, this.state]));
    }

    ws.addEventListener('message', e => {
      this.update();

      const data = JSON.parse(e.data) as Event;

      switch (data[0]) {
        case 1: {
          this.state = data[1];
          break
        }

        case 2: {
          this.state!.play = data[1].play;
          break
        }

        case 3: {
          this.state!.time = data[1].time;
          break
        }
      }

      for (const socket of this.clients) {
        if (socket != ws) {
          socket.send(e.data);
        }
      }
    });

    this.clients.push(ws);

    ws.addEventListener('close', () => {
      const index = this.clients.indexOf(ws);
      if (index != -1) this.clients.splice(index, 1);

      if (this.clients.length == 0) {
        rooms.delete(this.name);
      }
    })
  }
}

function random_id() {
  return [...Array(4)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function get_params(request: IncomingMessage) {
  if (request.url == null)
    throw new Error('url');

  const parsed = new URL(`test:${request.url}`);

  const name = parsed.searchParams.get('name')?.trim();

  return { name };
}
