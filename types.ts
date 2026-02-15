
export interface PianoKey {
  note: string;
  frequency: number;
  keyboardKey: string;
  keyboardCode: string;
  type: 'white' | 'black';
  octave: number;
}

export interface NoteEvent {
  note: string;
  time: number;
  duration?: number;
}

export type Theme = 'classic' | 'modern' | 'midnight';
