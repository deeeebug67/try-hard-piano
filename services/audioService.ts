export type PianoPreset = 'grand' | 'synth' | 'string' | 'honky-tonk' | 'violin';

class AudioService {
  private ctx: AudioContext | null = null;
  private activeOscillators: Map<string, { osc: OscillatorNode[]; gain: GainNode; lfo?: OscillatorNode }> = new Map();
  private masterGain: GainNode | null = null;
  private sustainTime: number = 4.0;
  private currentPreset: PianoPreset = 'grand';

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);
  }

  private resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSustain(seconds: number) {
    this.sustainTime = Math.max(0.05, seconds);
  }

  setPreset(preset: PianoPreset) {
    this.currentPreset = preset;
  }

  playNote(note: string, frequency: number) {
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    if (this.activeOscillators.has(note)) {
      this.stopNote(note, true);
    }

    const gain = this.ctx.createGain();
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    const oscillators: OscillatorNode[] = [];
    let lfo: OscillatorNode | undefined;

    // Reset gain start
    gain.gain.setValueAtTime(0, now);

    switch (this.currentPreset) {
      case 'violin':
        // Solo Violin simulation
        gain.gain.linearRampToValueAtTime(0.35, now + 0.15); // Medium attack
        
        const vosc1 = this.ctx.createOscillator();
        vosc1.type = 'sawtooth';
        vosc1.frequency.setValueAtTime(frequency, now);
        
        const vosc2 = this.ctx.createOscillator();
        vosc2.type = 'sawtooth';
        vosc2.frequency.setValueAtTime(frequency * 1.002, now); // Very slight detune for thickness
        
        // Vibrato (LFO)
        lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(5.5, now); // 5.5Hz vibrato
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(5, now); // Vibrato depth (cents)
        
        lfo.connect(lfoGain);
        lfoGain.connect(vosc1.detune);
        lfoGain.connect(vosc2.detune);
        
        vosc1.connect(gain);
        vosc2.connect(gain);
        oscillators.push(vosc1, vosc2);
        lfo.start();
        break;

      case 'synth':
        // Bright Square synth
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.3);
        
        const oscS1 = this.ctx.createOscillator();
        oscS1.type = 'square';
        oscS1.frequency.setValueAtTime(frequency, now);
        oscS1.connect(gain);
        
        const oscS2 = this.ctx.createOscillator();
        oscS2.type = 'sawtooth';
        oscS2.frequency.setValueAtTime(frequency * 1.005, now); // Slight detune
        oscS2.connect(gain);
        
        oscillators.push(oscS1, oscS2);
        break;

      case 'string':
        // Orchestral String - Slow attack
        gain.gain.linearRampToValueAtTime(0.2, now + 0.4); // Slow attack
        
        const oscStr1 = this.ctx.createOscillator();
        oscStr1.type = 'sawtooth';
        oscStr1.frequency.setValueAtTime(frequency, now);
        oscStr1.connect(gain);

        const oscStr2 = this.ctx.createOscillator();
        oscStr2.type = 'triangle';
        oscStr2.frequency.setValueAtTime(frequency * 0.5, now); // Sub octave
        oscStr2.connect(gain);

        oscillators.push(oscStr1, oscStr2);
        break;

      case 'honky-tonk':
        // Detuned upright piano
        gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.4);

        // Three detuned strings per note
        [0, 2.5, -2.5].forEach(detune => {
          const oscH = this.ctx.createOscillator();
          oscH.type = 'triangle';
          oscH.frequency.setValueAtTime(frequency, now);
          oscH.detune.setValueAtTime(detune, now);
          oscH.connect(gain);
          oscillators.push(oscH);
        });
        break;

      case 'grand':
      default:
        // Standard Grand Piano simulation
        gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.5);
        
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(frequency, now);
        osc1.connect(gain);

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(frequency * 2, now);
        osc2.connect(gain);
        oscillators.push(osc1, osc2);
        break;
    }

    oscillators.forEach(o => o.start());
    this.activeOscillators.set(note, { osc: oscillators, gain, lfo });
  }

  stopNote(note: string, immediate: boolean = false) {
    const entry = this.activeOscillators.get(note);
    if (!entry || !this.ctx) return;

    const { osc, gain, lfo } = entry;
    const now = this.ctx.currentTime;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    
    // Bowed instruments usually have a slightly longer natural release
    let releaseMultiplier = 1;
    if (this.currentPreset === 'string' || this.currentPreset === 'violin') {
        releaseMultiplier = 1.5;
    }

    const releaseTime = immediate ? 0.05 : (this.sustainTime * releaseMultiplier);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

    setTimeout(() => {
      osc.forEach(o => {
        try { o.stop(); o.disconnect(); } catch (e) {}
      });
      if (lfo) {
        try { lfo.stop(); lfo.disconnect(); } catch (e) {}
      }
      gain.disconnect();
    }, releaseTime * 1000 + 100);

    this.activeOscillators.delete(note);
  }

  setVolume(val: number) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx?.currentTime || 0, 0.1);
    }
  }
}

export const audioService = new AudioService();