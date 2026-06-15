import Phaser from "phaser";
import { settings } from "../config/settings";

const BG_FLAMINGO_FRAMES: [number, number, number, number][] = [
  [16, 0, 84, 135], [144, 0, 84, 135], [272, 0, 84, 135], [400, 0, 84, 135], [516, 0, 96, 135],
  [16, 135, 84, 135], [145, 135, 84, 135], [285, 135, 84, 135], [413, 135, 84, 135], [540, 135, 96, 135],
  [16, 270, 84, 135], [156, 270, 84, 135], [273, 270, 84, 135], [412, 270, 84, 135],
  [24, 405, 84, 135], [152, 405, 84, 135], [280, 405, 84, 135], [408, 405, 84, 135],
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    this.load.image("rama-1", "assets/rama-1.png");
    this.load.image("rama-2", "assets/rama-2.png");
    this.load.image("rama-3", "assets/rama-3.png");
    this.load.image("ground", "assets/ground.png");
    this.load.image("pipe-top", "assets/pipe-top.png");
    this.load.image("pipe-bottom", "assets/pipe-bottom.png");
    this.load.image("bg-flamingo-sheet", "assets/PixelFlamingoSpriteSheet.png");
    this.load.image("cloud-1", "assets/Cloud1.png");
    this.load.image("cloud-2", "assets/Cloud2.png");
    this.load.image("cloud-3", "assets/Cloud3.png");
    this.load.image("cloud-4", "assets/Cloud4.png");
    this.load.image("cloud-5", "assets/Cloud5.png");
    this.load.image("cloud-6", "assets/Cloud6.png");
    this.load.image("grass-tile", "assets/grass01.png");
    this.load.image("bush", "assets/bush.png");
    this.load.image("bush02", "assets/bush02.png");
    this.load.image("bush03", "assets/bush03.png");
    this.load.image("tree01", "assets/tree01.png");
    this.load.image("tree02", "assets/tree02.png");
    this.load.image("logo", "assets/logo.png");
    this.load.image("grass-02", "assets/grass02.png");
    this.load.image("grass-06", "assets/grass06.png");
    this.load.image("grass-07", "assets/grass07.png");
    this.load.image("game-over", "assets/game_over.png");
  }

  create(): void {
    this.anims.create({
      key: "rama-flap",
      frames: [
        { key: "rama-1" },
        { key: "rama-2" },
        { key: "rama-3" },
        { key: "rama-2" }
      ],
      frameRate: 4,
      repeat: -1
    });

    this.extractBgFlamingoFrames();
    this.createTerrainStrip();
    this.createDistantHills();

    this.scene.start("MenuScene");
  }

  private createTerrainStrip(): void {
    const src = this.textures.get("grass-tile").getSourceImage() as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = src.width + 1;
    canvas.height = 38;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(src, 0, 90, src.width, 38, 0, 0, src.width, 38);
    ctx.drawImage(src, 0, 90, 1, 38, src.width, 0, 1, 38);
    const tex = this.textures.addCanvas("terrain-strip", canvas);
    if (tex) tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  private createDistantHills(): void {
    const w = 256;
    const h = 300;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    const peaks = [58, 42, 65, 38, 72, 50, 60, 45];
    ctx.fillStyle = "#2d5a4a";
    ctx.beginPath();
    ctx.moveTo(0, 100);
    for (let x = 0; x <= w; x++) {
      const t = (x / w) * peaks.length;
      const i = Math.floor(t);
      const f = t - i;
      const y0 = peaks[i % peaks.length];
      const y1 = peaks[(i + 1) % peaks.length];
      const top = y0 + (y1 - y0) * f;
      ctx.lineTo(x, top);
    }
    ctx.lineTo(w, 100);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#3d6b3a";
    ctx.fillRect(0, 100, w, h - 100);

    const tex = this.textures.addCanvas("distant-hills", canvas);
    if (tex) tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  private extractBgFlamingoFrames(): void {
    const src = this.textures.get("bg-flamingo-sheet").getSourceImage() as HTMLImageElement;
    const animFrames: Phaser.Types.Animations.AnimationFrame[] = [];

    for (let i = 0; i < BG_FLAMINGO_FRAMES.length; i++) {
      const [sx, sy, sw, sh] = BG_FLAMINGO_FRAMES[i];
      const key = `bg-flamingo-frame-${i}`;
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
      this.textures.addCanvas(key, canvas);
      animFrames.push({ key });
    }

    this.anims.create({
      key: "bg-flamingo-walk",
      frames: animFrames,
      frameRate: 7,
      repeat: -1
    });
  }
}
