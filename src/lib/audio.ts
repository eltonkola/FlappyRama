import Phaser from "phaser";
import { settings } from "../config/settings";

type ToneName = "flap" | "score" | "crash";

export class AudioManager {
  private context?: AudioContext;
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  play(tone: ToneName): void {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    this.context ??= new AudioContextClass();
    if (this.context.state === "suspended") {
      void this.context.resume();
    }

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const tones = {
      flap: { frequency: 520, endFrequency: 700, duration: 0.08, type: "sine" },
      score: { frequency: 880, endFrequency: 1160, duration: 0.13, type: "triangle" },
      crash: { frequency: 140, endFrequency: 70, duration: 0.22, type: "sawtooth" }
    } satisfies Record<ToneName, { frequency: number; endFrequency: number; duration: number; type: OscillatorType }>;
    const selectedTone = tones[tone];

    oscillator.type = selectedTone.type;
    oscillator.frequency.setValueAtTime(selectedTone.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(selectedTone.endFrequency, now + selectedTone.duration);
    gain.gain.setValueAtTime(settings.audioVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + selectedTone.duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + selectedTone.duration);
  }

  unlock(): void {
    this.scene.input.once("pointerdown", () => this.play("flap"));
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
