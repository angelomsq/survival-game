import Phaser from 'phaser'
import config from './config'
import GardenScene from './scenes/garden.scene'
import LoadScene from './scenes/load.scene'
import HUDScene from './scenes/hud.scene'

new Phaser.Game(
  Object.assign(config, {
    scene: [LoadScene, GardenScene, HUDScene],
  })
)
