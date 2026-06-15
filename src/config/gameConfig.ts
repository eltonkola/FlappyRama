import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { GameScene } from "../scenes/GameScene";
import { MenuScene } from "../scenes/MenuScene";
import { GAME_HEIGHT, GAME_WIDTH } from "./settings";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#65c7f7",
  pixelArt: false,
  roundPixels: false,
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  input: {
    activePointers: 3
  }
};
