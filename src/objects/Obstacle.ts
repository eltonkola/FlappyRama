import Phaser from "phaser";
import { GAME_HEIGHT, settings } from "../config/settings";

export class Obstacle {
  public scored = false;
  public active = false;
  public x = 0;

  private readonly scene: Phaser.Scene;
  private readonly topPipe: Phaser.GameObjects.Image;
  private readonly bottomPipe: Phaser.GameObjects.Image;
  private readonly label: Phaser.GameObjects.Image;
  private readonly topBody: Phaser.Physics.Arcade.StaticBody;
  private readonly bottomBody: Phaser.Physics.Arcade.StaticBody;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.topPipe = scene.add.image(0, 0, "pipe-top").setOrigin(0.5).setDepth(50).setVisible(false).setActive(false);
    this.bottomPipe = scene.add.image(0, 0, "pipe-bottom").setOrigin(0.5).setDepth(50).setVisible(false).setActive(false);
    this.label = scene.add.image(0, 0, "pipe-label-placeholder").setOrigin(0.5).setDepth(50).setVisible(false).setActive(false);

    scene.physics.add.existing(this.topPipe, true);
    scene.physics.add.existing(this.bottomPipe, true);
    this.topBody = this.topPipe.body as Phaser.Physics.Arcade.StaticBody;
    this.bottomBody = this.bottomPipe.body as Phaser.Physics.Arcade.StaticBody;

    this.topBody.enable = false;
    this.bottomBody.enable = false;
  }

  spawn(x: number, gapCenter: number, labelText: string): void {
    const topHeight = Math.max(70, gapCenter - settings.obstacleGap / 2);
    const bottomY = gapCenter + settings.obstacleGap / 2;
    const bottomHeight = Math.max(70, GAME_HEIGHT - settings.groundHeight - bottomY);

    this.x = x;
    this.scored = false;
    this.active = true;

    this.topPipe.setVisible(true).setActive(true);
    this.bottomPipe.setVisible(true).setActive(true);

    this.topPipe.setDisplaySize(settings.obstacleWidth, topHeight);
    this.bottomPipe.setDisplaySize(settings.obstacleWidth, bottomHeight);

    this.label.setVisible(true).setActive(true);

    if (topHeight >= bottomHeight) {
      this.placeLabel(labelText, topHeight / 2, topHeight);
    } else {
      this.placeLabel(labelText, bottomY + bottomHeight / 2, bottomHeight);
    }

    this.updatePositions(topHeight, bottomY, bottomHeight);
  }

  move(distance: number): void {
    this.x -= distance;

    const topHeight = this.topPipe.displayHeight;
    const bottomHeight = this.bottomPipe.displayHeight;
    const bottomY = GAME_HEIGHT - settings.groundHeight - bottomHeight;

    this.updatePositions(topHeight, bottomY, bottomHeight);
  }

  deactivate(): void {
    this.active = false;
    this.topPipe.setActive(false).setVisible(false);
    this.bottomPipe.setActive(false).setVisible(false);
    this.label.setActive(false).setVisible(false);
    this.topBody.enable = false;
    this.bottomBody.enable = false;
  }

  getBodies(): Phaser.GameObjects.Image[] {
    return [this.topPipe, this.bottomPipe];
  }

  private updatePositions(topHeight: number, bottomY: number, bottomHeight: number): void {
    const topY = topHeight / 2;
    const bottomPipeY = bottomY + bottomHeight / 2;

    this.topPipe.setPosition(this.x, topY);
    this.bottomPipe.setPosition(this.x, bottomPipeY);

    if (topHeight >= bottomHeight) {
      this.label.setPosition(this.x, topY);
    } else {
      this.label.setPosition(this.x, bottomPipeY);
    }

    this.topBody.enable = true;
    this.bottomBody.enable = true;
    this.topBody.setSize(settings.obstacleWidth, topHeight);
    this.bottomBody.setSize(settings.obstacleWidth, bottomHeight);
    this.topBody.updateFromGameObject();
    this.bottomBody.updateFromGameObject();
  }

  private placeLabel(label: string, y: number, maxHeight: number): void {
    const textureKey = this.getLabelTextureKey(label, maxHeight);
    const texture = this.scene.textures.get(textureKey);
    if (!texture) {
      throw new Error(`Missing pipe label texture: ${textureKey}`);
    }
    const frame = texture.getSourceImage() as HTMLCanvasElement;

    this.label
      .setTexture(textureKey)
      .setDisplaySize(frame.width, frame.height)
      .setPosition(this.x, y);
  }

  private getLabelTextureKey(label: string, maxHeight: number): string {
    const normalizedLabel = label.toUpperCase();
    const textureKey = `pipe-label-${this.hashLabel(normalizedLabel)}-${maxHeight}`;

    if (!this.scene.textures.exists(textureKey)) {
      this.createLabelTexture(textureKey, normalizedLabel, maxHeight);
    }

    return textureKey;
  }

  private createLabelTexture(textureKey: string, label: string, maxHeight: number): void {
    const width = 64;
    const padding = 16;
    const idealLetterHeight = 18;
    const idealFontSize = 17;
    const idealHeight = label.length * idealLetterHeight + padding;

    let letterHeight: number;
    let fontSize: number;

    if (idealHeight <= maxHeight) {
      letterHeight = idealLetterHeight;
      fontSize = idealFontSize;
    } else {
      const available = maxHeight - padding;
      letterHeight = Math.max(8, Math.floor(available / label.length));
      fontSize = Math.max(7, letterHeight - 1);
    }

    const height = label.length * letterHeight + padding;
    const texture = this.scene.textures.createCanvas(textureKey, width, height);
    if (!texture) {
      throw new Error(`Unable to create pipe label texture: ${textureKey}`);
    }
    const context = texture.getContext();

    context.clearRect(0, 0, width, height);
    context.font = `900 ${fontSize}px Arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineJoin = "round";

    const startY = (height - (label.length - 1) * letterHeight) / 2;
    [...label].forEach((letter, index) => {
      const y = startY + index * letterHeight;
      context.strokeStyle = "#06491e";
      context.lineWidth = 5;
      context.strokeText(letter, width / 2, y);
      context.fillStyle = "#ffffff";
      context.fillText(letter, width / 2, y);
    });

    texture.refresh();
  }

  private hashLabel(label: string): string {
    let hash = 0;
    for (let index = 0; index < label.length; index += 1) {
      hash = (hash * 31 + label.charCodeAt(index)) >>> 0;
    }
    return hash.toString(36);
  }
}
