
import { PianoKey } from './types';

// Frequencies for notes (A4 = 440Hz)
const getFreq = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export const KEY_MAPPINGS: PianoKey[] = [
  // Bass Octave (C3 - B3)
  { note: 'C3', frequency: getFreq(48), keyboardKey: '1', keyboardCode: 'Digit1', type: 'white', octave: 3 },
  { note: 'C#3', frequency: getFreq(49), keyboardKey: 'Z', keyboardCode: 'KeyZ', type: 'black', octave: 3 },
  { note: 'D3', frequency: getFreq(50), keyboardKey: '2', keyboardCode: 'Digit2', type: 'white', octave: 3 },
  { note: 'D#3', frequency: getFreq(51), keyboardKey: 'X', keyboardCode: 'KeyX', type: 'black', octave: 3 },
  { note: 'E3', frequency: getFreq(52), keyboardKey: '3', keyboardCode: 'Digit3', type: 'white', octave: 3 },
  { note: 'F3', frequency: getFreq(53), keyboardKey: '4', keyboardCode: 'Digit4', type: 'white', octave: 3 },
  { note: 'F#3', frequency: getFreq(54), keyboardKey: 'C', keyboardCode: 'KeyC', type: 'black', octave: 3 },
  { note: 'G3', frequency: getFreq(55), keyboardKey: '5', keyboardCode: 'Digit5', type: 'white', octave: 3 },
  { note: 'G#3', frequency: getFreq(56), keyboardKey: 'V', keyboardCode: 'KeyV', type: 'black', octave: 3 },
  { note: 'A3', frequency: getFreq(57), keyboardKey: '6', keyboardCode: 'Digit6', type: 'white', octave: 3 },
  { note: 'A#3', frequency: getFreq(58), keyboardKey: 'B', keyboardCode: 'KeyB', type: 'black', octave: 3 },
  { note: 'B3', frequency: getFreq(59), keyboardKey: '7', keyboardCode: 'Digit7', type: 'white', octave: 3 },

  // Lead Octave (C4 - F5)
  { note: 'C4', frequency: getFreq(60), keyboardKey: 'A', keyboardCode: 'KeyA', type: 'white', octave: 4 },
  { note: 'C#4', frequency: getFreq(61), keyboardKey: 'W', keyboardCode: 'KeyW', type: 'black', octave: 4 },
  { note: 'D4', frequency: getFreq(62), keyboardKey: 'S', keyboardCode: 'KeyS', type: 'white', octave: 4 },
  { note: 'D#4', frequency: getFreq(63), keyboardKey: 'E', keyboardCode: 'KeyE', type: 'black', octave: 4 },
  { note: 'E4', frequency: getFreq(64), keyboardKey: 'D', keyboardCode: 'KeyD', type: 'white', octave: 4 },
  { note: 'F4', frequency: getFreq(65), keyboardKey: 'F', keyboardCode: 'KeyF', type: 'white', octave: 4 },
  { note: 'F#4', frequency: getFreq(66), keyboardCode: 'KeyT', keyboardKey: 'T', type: 'black', octave: 4 },
  { note: 'G4', frequency: getFreq(67), keyboardKey: 'G', keyboardCode: 'KeyG', type: 'white', octave: 4 },
  { note: 'G#4', frequency: getFreq(68), keyboardKey: 'Y', keyboardCode: 'KeyY', type: 'black', octave: 4 },
  { note: 'A4', frequency: getFreq(69), keyboardKey: 'H', keyboardCode: 'KeyH', type: 'white', octave: 4 },
  { note: 'A#4', frequency: getFreq(70), keyboardKey: 'U', keyboardCode: 'KeyU', type: 'black', octave: 4 },
  { note: 'B4', frequency: getFreq(71), keyboardKey: 'J', keyboardCode: 'KeyJ', type: 'white', octave: 4 },
  { note: 'C5', frequency: getFreq(72), keyboardKey: 'K', keyboardCode: 'KeyK', type: 'white', octave: 5 },
  { note: 'C#5', frequency: getFreq(73), keyboardKey: 'O', keyboardCode: 'KeyO', type: 'black', octave: 5 },
  { note: 'D5', frequency: getFreq(74), keyboardKey: 'L', keyboardCode: 'KeyL', type: 'white', octave: 5 },
  { note: 'D#5', frequency: getFreq(75), keyboardKey: 'P', keyboardCode: 'KeyP', type: 'black', octave: 5 },
  { note: 'E5', frequency: getFreq(76), keyboardKey: ';', keyboardCode: 'Semicolon', type: 'white', octave: 5 },
  { note: 'F5', frequency: getFreq(77), keyboardKey: "'", keyboardCode: 'Quote', type: 'white', octave: 5 },
];
