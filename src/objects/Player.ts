import Phaser from "phaser";
import { settings } from "../config/settings";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "rama-1");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(51);
    this.setScale(0.5);
    this.setCircle(34, 71, 66);
    this.setCollideWorldBounds(false);
    this.play("rama-flap");
  }

  flap(): void {
    this.setVelocityY(settings.flapVelocity);
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.5 * 1.14,
      scaleY: 0.5 * 0.86,
      duration: 110,
      yoyo: true,
      ease: "Quad.out"
    });
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.rotation = Phaser.Math.Clamp(body.velocity.y / 620, -0.58, 1.05);
  }
}
