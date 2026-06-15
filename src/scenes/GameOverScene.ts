import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/settings";
import { AudioManager } from "../lib/audio";
import { Background } from "../objects/Background";

type GameOverData = {
  score: number;
  bestScore: number;
};

export class GameOverScene extends Phaser.Scene {
  private background?: Background;
  private audio?: AudioManager;
  private dataValues: GameOverData = { score: 0, bestScore: 0 };

  constructor() {
    super("GameOverScene");
  }

  init(data: GameOverData): void {
    this.dataValues = data;
  }

  create(): void {
    this.background = new Background(this);
    this.audio = new AudioManager(this);

    const gScale = 0.35;
    this.add
      .image(GAME_WIDTH / 2, 200, "game-over")
      .setScale(gScale)
      .setDepth(100);

    this.add
      .text(GAME_WIDTH / 2, 340, `${this.dataValues.score}`, {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "42px",
        color: "#24425e",
      })
      .setOrigin(0.5)
      .setDepth(101);

    this.add
      .text(GAME_WIDTH / 2, 385, `BEST ${this.dataValues.bestScore}`, {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "22px",
        color: "#24425e",
      })
      .setOrigin(0.5)
      .setDepth(101);

    const restartButton = this.add
      .text(GAME_WIDTH / 2, 480, "RESTART", {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "30px",
        color: "#ffffff",
        backgroundColor: "#2fbfae",
        padding: { x: 28, y: 14 },
        shadow: { offsetY: 4, color: "#168978", fill: true }
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: restartButton,
      y: restartButton.y - 6,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });

    restartButton.on("pointerdown", () => this.restart());
    this.input.keyboard?.once("keydown-SPACE", () => this.restart());
    this.input.keyboard?.once("keydown-ENTER", () => this.restart());
  }

  update(_time: number, delta: number): void {
    this.background?.update(delta, 0.8);
  }

  private restart(): void {
    this.audio?.play("flap");
    this.cameras.main.fadeOut(150, 255, 255, 255);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start("GameScene");
    });
  }
}
