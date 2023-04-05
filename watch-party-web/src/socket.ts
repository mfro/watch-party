import { reactive } from 'vue';
import { Event } from 'watch-party';

export interface Room {
  status: 'CONNECTING' | 'OK' | 'DISCONNECTED';
  name: null | string;

  state: null | {
    url: string,
    play: boolean,
    time: number,
  }

  init(url: string): void;
  play(play: boolean): void;
  time(time: number): void;
}

export namespace Room {
  function setup(name?: string) {
    const base = localStorage.getItem('mfro:watch-party:server') ?? 'wss://api.mfro.me/watch-party/';

    const url = new URL(base);
    if (name) {
      url.searchParams.set('name', name);
    }

    const ws = new WebSocket(url.toString());

    const state: Room = reactive({
      status: 'CONNECTING',
      name: null,
      state: null,

      init(url) {
        state.state = {
          url,
          play: false,
          time: 0,
        };

        send(1, state.state);
      },

      play(play) {
        state.state!.play = play;
        send(2, { play });
      },

      time(time) {
        state.state!.time = time;
        send(3, { time });
      },
    });

    ws.addEventListener('open', e => {
      console.log('open');
      state.status = 'OK';
    });

    ws.addEventListener('close', e => {
      console.log('close');
      state.status = 'DISCONNECTED';
    });

    ws.addEventListener('error', e => {
      console.log(e);
      state.status = 'DISCONNECTED';
    });

    ws.addEventListener('message', e => {
      const data = JSON.parse(e.data) as Event;

      switch (data[0]) {
        case 0: {
          state.name = data[1].name;
          break
        }

        case 1: {
          state.state = data[1];
          break
        }

        case 2: {
          state.state!.play = data[1].play;
          break
        }

        case 3: {
          state.state!.time = data[1].time;
          break
        }
      }
    });

    function send(...e: Event) {
      const raw = JSON.stringify(e);
      ws.send(raw);
    }

    return state;
  }

  export function create(): Room {
    return setup();
  }

  export function join(name: string): Room {
    return setup(name);
  }
}
