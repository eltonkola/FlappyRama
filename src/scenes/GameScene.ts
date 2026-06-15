import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, settings } from "../config/settings";
import { AudioManager } from "../lib/audio";
import { saveBestScore } from "../lib/storage";
import { Background } from "../objects/Background";
import { Obstacle } from "../objects/Obstacle";
import { Player } from "../objects/Player";

export class GameScene extends Phaser.Scene {
  private background?: Background;
  private player?: Player;
  private audio?: AudioManager;
  private scoreText?: Phaser.GameObjects.Text;
  private score = 0;
  private speed: number = settings.startingObstacleSpeed;
  private elapsedSinceSpawn = 0;
  private isGameOver = false;
  private pipeLabelIndex = 0;
  private readonly obstacles: Obstacle[] = [];

  constructor() {
    super("GameScene");
  }

  init(): void {
    this.score = 0;
    this.speed = settings.startingObstacleSpeed;
    this.elapsedSinceSpawn = 0;
    this.isGameOver = false;
    this.pipeLabelIndex = 0;
    this.obstacles.length = 0;
  }

  create(): void {
    this.physics.world.gravity.y = settings.gravity;
    this.background = new Background(this);
    this.audio = new AudioManager(this);

    this.player = new Player(this, settings.playerX, GAME_HEIGHT * 0.44);
    this.player.flap();

    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 58, "0", {
        fontFamily: "Arial Black, system-ui, sans-serif",
        fontSize: "48px",
        color: "#ffffff",
        stroke: "#1c5d83",
        strokeThickness: 7
      })
      .setOrigin(0.5)
      .setDepth(100);

    for (let index = 0; index < 5; index += 1) {
      this.obstacles.push(new Obstacle(this));
    }

    this.spawnObstacle();
    this.input.on("pointerdown", () => this.flap());
    this.input.keyboard?.on("keydown-SPACE", () => this.flap());
    this.cameras.main.fadeIn(180, 255, 255, 255);
  }

  update(_time: number, delta: number): void {
    if (!this.player || this.isGameOver) {
      return;
    }

    this.background?.update(delta, this.speed / settings.startingObstacleSpeed);
    this.player.update();

    const distance = (this.speed * delta) / 1000;
    this.elapsedSinceSpawn += delta;
    if (this.elapsedSinceSpawn >= settings.obstacleSpawnMs) {
      this.elapsedSinceSpawn = 0;
      this.spawnObstacle();
    }

    for (const obstacle of this.obstacles) {
      if (!obstacle.active) {
        continue;
      }
      obstacle.move(distance);
      this.physics.world.overlap(this.player, obstacle.getBodies(), () => this.endGame());

      if (!obstacle.scored && obstacle.x + settings.obstacleWidth / 2 < this.player.x) {
        obstacle.scored = true;
        this.addScore();
      }

      if (obstacle.x < -settings.obstacleWidth) {
        obstacle.deactivate();
      }
    }

    if (this.player.y < -36 || this.player.y > GAME_HEIGHT - settings.groundHeight - 10) {
      this.endGame();
    }
  }

  private flap(): void {
    if (this.isGameOver || !this.player) {
      return;
    }
    this.player.flap();
    this.audio?.play("flap");
  }

  private spawnObstacle(): void {
    const obstacle = this.obstacles.find((candidate) => !candidate.active);
    if (!obstacle) {
      return;
    }

    const gapMargin = 132;
    const gapCenter = Phaser.Math.Between(gapMargin, GAME_HEIGHT - settings.groundHeight - gapMargin);
    obstacle.spawn(GAME_WIDTH + settings.obstacleWidth, gapCenter, this.nextPipeLabel());
  }

  private nextPipeLabel(): string {
    const label = settings.pipeLabels[this.pipeLabelIndex % settings.pipeLabels.length];
    this.pipeLabelIndex += 1;
    return label;
  }

  private addScore(): void {
    this.score += 1;
    this.speed = Math.min(settings.maxObstacleSpeed, settings.startingObstacleSpeed + this.score * settings.speedIncreasePerScore);
    this.scoreText?.setText(String(this.score));
    this.audio?.play("score");
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.28,
      duration: 90,
      yoyo: true,
      ease: "Back.out"
    });
  }

  private endGame(): void {
    if (this.isGameOver || !this.player) {
      return;
    }

    this.isGameOver = true;
    this.audio?.play("crash");
    this.physics.world.gravity.y = 0;
    this.player.setVelocity(0, 0);
    this.player.stop();
    this.cameras.main.shake(170, 0.012);
    this.tweens.add({
      targets: this.player,
      angle: 100,
      y: GAME_HEIGHT - settings.groundHeight - 28,
      duration: 420,
      ease: "Quad.in",
      onComplete: () => {
        const bestScore = saveBestScore(this.score);
        this.scene.start("GameOverScene", { score: this.score, bestScore });
      }
    });
  }
}
