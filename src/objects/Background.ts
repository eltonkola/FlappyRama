import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, settings } from "../config/settings";

type Cloud = Phaser.GameObjects.Image & { speed: number };
type Flamingo = Phaser.GameObjects.Sprite & { speed: number; bobOffset: number };
type ParallaxItem = Phaser.GameObjects.Image & { speed: number };

export class Background {
  private readonly scene: Phaser.Scene;
  private readonly clouds: Cloud[] = [];
  private readonly bushes: ParallaxItem[] = [];
  private readonly flamingos: Flamingo[] = [];
  private readonly fgElements: ParallaxItem[] = [];
  private mountains: Phaser.GameObjects.TileSprite;
  private groundTiles: Phaser.GameObjects.TileSprite;
  private terrainStrip: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createSky(); // depth 0
    this.createClouds(); // depth 1
    this.mountains = this.createMountains(); // depth 2
    this.createBushes(); // depth 3
    this.createFlamingos(); // depth 4
    this.groundTiles = this.createGround(); // depth 6
    this.terrainStrip = this.createTerrain(); // depth 7
    this.createFgElements(); // depth 8
  }

  update(delta: number, speedMultiplier = 1): void {
    const s = delta / 1000;

    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed * speedMultiplier * s;
      if (cloud.x < -cloud.width) {
        cloud.x = GAME_WIDTH + cloud.width;
        cloud.y = Phaser.Math.Between(60, 350);
      }
    }

    this.mountains.tilePositionX += 8 * speedMultiplier * s;

    for (const bush of this.bushes) {
      bush.x -= bush.speed * speedMultiplier * s;
      if (bush.x < -bush.width * bush.scaleX) {
        bush.x = GAME_WIDTH + Phaser.Math.Between(30, 120);
      }
    }

    for (const flamingo of this.flamingos) {
      flamingo.x -= flamingo.speed * speedMultiplier * s;
      flamingo.y += Math.sin(this.scene.time.now / 260 + flamingo.bobOffset) * 0.18;
      if (flamingo.x < -60) {
        flamingo.x = GAME_WIDTH + Phaser.Math.Between(30, 190);
        flamingo.y = Phaser.Math.Between(510, 620);
      }
    }

    this.groundTiles.tilePositionX += 96 * speedMultiplier * s;
    this.terrainStrip.tilePositionX += 50 * speedMultiplier * s;

    for (const fg of this.fgElements) {
      fg.x -= fg.speed * speedMultiplier * s;
      if (fg.x < -fg.width * fg.scaleX) {
        fg.x = GAME_WIDTH + Phaser.Math.Between(20, 160);
      }
    }
  }

  private createSky(): void {
    const graphics = this.scene.add.graphics();
    graphics.fillGradientStyle(0x5fc7ff, 0x5fc7ff, 0xdff7ff, 0xdff7ff, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const sun = this.scene.add.circle(GAME_WIDTH - 54, 78, 34, 0xfff2a6, 0.72);
    this.scene.tweens.add({
      targets: sun,
      scale: 1.08,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  private createClouds(): void {
    const cloudKeys = ["cloud-1", "cloud-2", "cloud-3", "cloud-4", "cloud-5", "cloud-6"];
    const cloudData = [
      { x: 58, y: 108, scale: 1.5, speed: 18 * settings.parallax.farClouds },
      { x: 260, y: 170, scale: 2.0, speed: 22 * settings.parallax.farClouds },
      { x: 116, y: 292, scale: 1.8, speed: 30 * settings.parallax.midClouds },
      { x: 332, y: 360, scale: 1.6, speed: 34 * settings.parallax.midClouds },
    ];

    for (const data of cloudData) {
      const key = Phaser.Math.RND.pick(cloudKeys);
      const cloud = this.scene.add.image(data.x, data.y, key) as Cloud;
      cloud.speed = data.speed;
      cloud.setAlpha(0.85);
      cloud.setScale(data.scale);
      cloud.setDepth(1);
      this.clouds.push(cloud);
    }
  }

  private createMountains(): Phaser.GameObjects.TileSprite {
    const hills = this.scene.add.tileSprite(GAME_WIDTH / 2, 550, GAME_WIDTH, 200, "distant-hills");
    hills.setDepth(2);
    return hills;
  }

  private createBushes(): void {
    const keys = ["bush", "bush02", "bush03"];
    const positions = [
      { x: 80, y: 530, scale: 0.5 },
      { x: 200, y: 560, scale: 0.4 },
      { x: 330, y: 540, scale: 0.55 },
      { x: GAME_WIDTH + 50, y: 550, scale: 0.45 },
    ];
    for (const data of positions) {
      const key = Phaser.Math.RND.pick(keys);
      const bush = this.scene.add.image(data.x, data.y, key) as ParallaxItem;
      bush.speed = Phaser.Math.FloatBetween(14, 18);
      bush.setScale(data.scale);
      bush.setAlpha(0.65);
      bush.setDepth(3);
      this.bushes.push(bush);
    }
  }

  private createFlamingos(): void {
    const frameCount = 18;
    for (const data of [
      { x: 80, y: 560, scale: 0.58 },
      { x: 300, y: 605, scale: 0.48 },
    ]) {
      const flamingo = this.scene.add.sprite(data.x, data.y, "bg-flamingo-frame-0") as Flamingo;
      flamingo.speed = 42 * settings.parallax.flamingos;
      flamingo.bobOffset = Math.random() * Math.PI * 2;
      flamingo.setScale(data.scale);
      flamingo.setDepth(4);
      flamingo.play({ key: "bg-flamingo-walk", startFrame: Phaser.Math.Between(0, frameCount - 1) });
      flamingo.anims.timeScale = Phaser.Math.FloatBetween(0.7, 1.3);
      if (Math.random() > 0.5) {
        flamingo.setFlipX(true);
      }
      this.flamingos.push(flamingo);
    }
  }

  private createGround(): Phaser.GameObjects.TileSprite {
    const ground = this.scene.add.tileSprite(
      GAME_WIDTH / 2,
      GAME_HEIGHT - settings.groundHeight / 2,
      GAME_WIDTH,
      settings.groundHeight,
      "ground"
    );
    ground.setDepth(6);
    return ground;
  }

  private createTerrain(): Phaser.GameObjects.TileSprite {
    const groundTop = GAME_HEIGHT - settings.groundHeight;
    const h = 38;
    const terrain = this.scene.add.tileSprite(
      GAME_WIDTH / 2,
      groundTop - h / 2,
      GAME_WIDTH,
      h,
      "terrain-strip"
    );
    terrain.setDepth(7);
    return terrain;
  }

  private createFgElements(): void {
    const groundY = GAME_HEIGHT - settings.groundHeight;
    const positions = [
      { x: 40, key: "tree01", scale: 0.45 },
      { x: 160, key: "tree02", scale: 0.5 },
      { x: 300, key: "bush02", scale: 0.65 },
      { x: GAME_WIDTH + 60, key: "bush03", scale: 0.7 },
    ];
    for (const data of positions) {
      const fg = this.scene.add.image(data.x, groundY - 128 * data.scale, data.key) as ParallaxItem;
      fg.speed = Phaser.Math.FloatBetween(55, 70);
      fg.setScale(data.scale);
      fg.setDepth(8);
      fg.setAlpha(0.85);
      this.fgElements.push(fg);
    }
  }
}
