import Phaser from 'phaser'

export default {
  type: Phaser.AUTO,
  parent: 'game',
  // backgroundColor: '#33A5E7',
  width: 448,
  height: 252,
  zoom: 4,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      // debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: { pixelArt: true, antialias: false },
}
