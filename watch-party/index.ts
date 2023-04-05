export type RoomNameEvent = {
  name: string,
}

export type InitEvent = {
  url: string,
  play: boolean,
  time: number,
}

export interface PlayEvent {
  play: boolean,
}

export interface TimeEvent {
  time: number,
}

export type Event =
  | [0, RoomNameEvent]
  | [1, InitEvent]
  | [2, PlayEvent]
  | [3, TimeEvent]
