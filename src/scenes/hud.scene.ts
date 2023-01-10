import Phaser from 'phaser'

import { sceneEvents } from '../events'

export default class HUDScene extends Phaser.Scene {
  private healthHUD!: Phaser.GameObjects.Group
  private bulletHUD!: Phaser.GameObjects.Group
  constructor() {
    super({
      key: 'HUDScene',
    })
  }

  create() {
    this.healthHUD = this.add.group({
      classType: Phaser.GameObjects.Image,
    })
    this.bulletHUD = this.add.group({
      classType: Phaser.GameObjects.Image,
    })

    this.bulletHUD.createMultiple({
      key: 'redOrb',
      setXY: {
        x: 8,
        y: 24,
        stepX: 10,
      },
      quantity: 1,
    })

    this.healthHUD.createMultiple({
      key: 'heartRed',
      setXY: {
        x: 8,
        y: 8,
        stepX: 10,
      },
      quantity: 5,
    })

    sceneEvents.on('player-maxHealth', this.updateMaxHealthHUD, this)
    sceneEvents.on('player-health', this.updateHealthHUD, this)
    sceneEvents.on('player-maxBullets', this.updateMaxBulletHUD, this)
    sceneEvents.on('player-bullets', this.updateBulletHUD, this)
  }

  updateHealthHUD(health: number) {
    this.healthHUD.children.each((image, index) => {
      const heart = image as Phaser.GameObjects.Image
      if (index < health) {
        heart.setTexture('heartRed')
      } else {
        heart.setTexture('heartGray')
      }
    })
  }

  updateBulletHUD(bullets: number) {
    this.bulletHUD.children.each((image, index) => {
      const bullet = image as Phaser.GameObjects.Image
      if (index < bullets) {
        bullet.clearAlpha()
      } else {
        bullet.setAlpha(0.4)
      }
    })
  }

  updateMaxHealthHUD(amount: number) {
    console.log('EVENT MAX HEALTH:', amount)
    this.healthHUD.clear(true, true)
    this.healthHUD.createMultiple({
      key: 'heartRed',
      setXY: {
        x: 8,
        y: 8,
        stepX: 10,
      },
      frameQuantity: amount,
    })
    console.log('Hearts Count:', this.healthHUD.children.size)
  }

  updateMaxBulletHUD(amount: number) {
    console.log('EVENT MAX BULLET:', amount)
    this.bulletHUD.clear(true, true)
    this.bulletHUD.createMultiple({
      key: 'redOrb',
      setXY: {
        x: 8,
        y: 24,
        stepX: 10,
      },
      frameQuantity: amount,
    })
    console.log('Bullet Count:', this.bulletHUD.children.size)
  }
}
