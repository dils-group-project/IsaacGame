export default {
  parent: 'game',
  type: Phaser.AUTO,
  parent: "Game",
  width: 700,
  height: 400,
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      // gravity: { y: 1900 }
    }
  }
};
