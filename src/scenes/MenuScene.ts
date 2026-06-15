import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, settings } from "../config/settings";
import { AudioManager } from "../lib/audio";
import { getBestScore } from "../lib/storage";
import { Background } from "../objects/Background";

export class MenuScene extends Phaser.Scene {
  private background?: Background;
  private audio?: AudioManager;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.background = new Background(this);
    this.audio = new AudioManager(this);
    this.audio.unlock();

    const logoScale = 0.42;
    const logoCY = 180;
    this.add
      .image(GAME_WIDTH / 2, logoCY, "logo")
      .setScale(logoScale)
      .setDepth(10);

    const logoBottom = logoCY + 680 * logoScale / 2;
    this.add
      .text(GAME_WIDTH / 2, logoBottom + 18, "RnbBnb", {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "16px",
        color: "#ff6fa7",
        letterSpacing: 6
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(GAME_WIDTH / 2, logoBottom + 58, `BEST ${getBestScore()}`, {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "24px",
        color: "#24425e"
      })
      .setOrigin(0.5)
      .setDepth(10);

    const playButton = this.add
      .text(GAME_WIDTH / 2, 480, "PLAY", {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "38px",
        color: "#ffffff",
        backgroundColor: "#ff6fa7",
        padding: { x: 48, y: 18 },
        shadow: { offsetY: 4, color: "#c94677", fill: true }
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: playButton,
      y: playButton.y - 6,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });

    this.add
      .text(GAME_WIDTH / 2, 585, "ABOUT", {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "20px",
        color: "#24425e",
        backgroundColor: "#e8f4f8",
        padding: { x: 28, y: 10 },
        shadow: { offsetY: 2, color: "#c0d8e0", fill: true }
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.showAboutDialog());

    playButton.on("pointerdown", () => this.startGame());
    this.input.keyboard?.once("keydown-SPACE", () => this.startGame());
    this.input.keyboard?.once("keydown-ENTER", () => this.startGame());
  }

  update(_time: number, delta: number): void {
    this.background?.update(delta, 0.8);
  }

  private startGame(): void {
    this.audio?.play("flap");
    this.cameras.main.fadeOut(180, 255, 255, 255);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start("GameScene");
    });
  }

  private showAboutDialog(): void {
    const dialogDepth = 100;
    const dialogWidth = GAME_WIDTH - 48;

    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1c0a1a, 0.35)
      .setOrigin(0)
      .setDepth(dialogDepth)
      .setInteractive();

    const dialogX = GAME_WIDTH / 2;
    const dialogY = GAME_HEIGHT / 2 - 10;
    const dialogHeight = 360;

    const bg = this.add.rectangle(0, 0, dialogWidth, dialogHeight, 0xfff0f5, 0.99)
      .setOrigin(0.5)
      .setDepth(dialogDepth + 1);

    const close = () => {
      overlay.destroy();
      container.destroy();
      closeBtn.destroy();
    };

    const closeBtn = this.add.text(
      dialogX + dialogWidth / 2 - 16,
      dialogY - dialogHeight / 2 + 16,
      "✕",
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        color: "#c94677"
      }
    )
      .setOrigin(0.5)
      .setDepth(dialogDepth + 3)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", close);

    const container = this.add.container(dialogX, dialogY, [
      bg,
      this.add.text(0, -155, "ABOUT", {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "26px",
        color: "#c94677"
      }).setOrigin(0.5).setDepth(dialogDepth + 2),
      this.add.text(0, -35, settings.aboutBody.join("\n"), {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#1a1a1a",
        align: "center",
        lineSpacing: 5
      }).setOrigin(0.5).setDepth(dialogDepth + 2),
      this.add.text(0, 100, settings.aboutCta, {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "14px",
        color: "#ff4f8a",
        align: "center",
        lineSpacing: 2
      }).setOrigin(0.5).setDepth(dialogDepth + 2),
    ])
      .setDepth(dialogDepth + 1);

    overlay.on("pointerdown", close);
  }
}
