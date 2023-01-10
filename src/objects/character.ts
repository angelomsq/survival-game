import { ICharacter } from '../interfaces/character.interface'
import { Bullet } from './bullet'

import BaseScene from '../scenes/base.scene'

export class Character extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body

  // variables
  protected currentScene: BaseScene
  protected isDamaged: boolean
  protected isDying: boolean
  protected isInvincible: boolean
  protected isAttacking: boolean
  protected speed: number
  protected health: number
  protected maxHealth: number
  protected maxBullets: number
  protected direction: string
  protected fireRate: number
  protected damagedRate: number
  protected lastFired: number
  protected hurtBox: Phaser.GameObjects.Rectangle
  protected shadow: Phaser.GameObjects.Sprite
  protected healthBar: Phaser.GameObjects.Sprite[]
  protected bullets: Phaser.GameObjects.Group
  // protected frameDebug: Phaser.GameObjects.Rectangle

  getHurtBox(): Phaser.GameObjects.Rectangle {
    return this.hurtBox
  }

  getHealth(): number {
    return this.health
  }

  getMaxHealth(): number {
    return this.maxHealth
  }

  setMaxHealth(maxHealth: number) {
    this.maxHealth = maxHealth
    this.health = maxHealth
  }

  addHealth(amount: number) {
    if (this.health + amount > this.maxHealth) this.health = this.maxHealth
    else this.health += amount
  }

  getMaxBullets(): number {
    return this.maxBullets
  }

  addBullets(amount: number) {
    if (this.maxBullets + amount <= 5) {
      this.maxBullets += amount

      this.bullets.createMultiple({
        frameQuantity: amount,
        key: 'fireball',
        active: false,
        visible: false,
        classType: Bullet,
      })
    }
  }

  constructor(attributes: ICharacter) {
    super(attributes.scene, attributes.x, attributes.y, attributes.texture, attributes.frame)

    // variables
    this.currentScene = attributes.scene as BaseScene
    this.isDamaged = false
    this.isDying = false
    this.isInvincible = false
    this.isAttacking = false
    this.lastFired = 0
    this.direction = 'down'

    //Sprite attributes
    this.speed = attributes.speed
    this.health = attributes.health
    this.maxHealth = attributes.maxHealth
    this.maxBullets = attributes.maxBullets
    this.fireRate = attributes.fireRate
    this.damagedRate = attributes.damagedRate
    this.bullets = attributes.bullets

    this.bullets.createMultiple({
      frameQuantity: this.maxBullets,
      key: 'fireball',
      active: false,
      visible: false,
      classType: Bullet,
    })
    this.bullets.setDepth(99)

    // console.log(this.bullets)

    this.hurtBox = this.currentScene.add
      .rectangle(this.x, this.y, attributes.width * 0.7, attributes.height, 0x6666ff)
      .setVisible(false)
    this.hurtBox.setData('parent', this)

    this.shadow = this.currentScene.add.sprite(this.x, this.y, 'shadow')
    this.shadow.setAlpha(0.4)
    this.shadow.setDepth(5)

    this.healthBar = []

    this.initSprite(attributes)
    this.currentScene.add.existing(this)
  }

  protected initSprite(attributes: ICharacter) {
    this.setOrigin(0.5, 0.5)
    this.currentScene.physics.world.enable(this)
    this.setCollisionBody(attributes.width, attributes.height)
    this.anims.play(`${this.texture.key}-idle-${this.direction}`)
    this.currentScene.events.on('prerender', () => {
      this.updateShadow()
      // this.setPosition(Math.round(this.x), Math.round(this.y))
    })
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)
    this.handleAnimation()
    // console.log(this.width)
    // console.log(this.body.offset)
  }

  protected handleAnimation(): void {
    if (!this.isDying) {
      if (this.body.velocity.x != 0 || this.body.velocity.y != 0) {
        this.anims.play(`${this.texture.key}-walk-${this.direction}`, true)
      } else {
        this.anims.play(`${this.texture.key}-idle-${this.direction}`, true)
      }
    } else {
      this.kill()
    }
  }

  protected setCollisionBody(width: number, height: number) {
    this.setSize(width * 0.4, height * 0.3)
    this.body.setSize(width * 0.4, height * 0.3, true)
    let offsetX = Math.round((width - this.body.width) / 2)
    let offsetY = Math.round(height - this.body.height)
    this.body.setOffset(offsetX, offsetY)
  }

  protected updateShadow() {
    this.shadow.setPosition(this.x, this.y + this.height / 2 - 1)
    this.hurtBox.setPosition(this.x, this.y)
  }

  protected depthSort(object: Phaser.GameObjects.Sprite): void {
    if (this.y < object.y) {
      this.setDepth(object.depth - 1)
    } else {
      this.setDepth(object.depth + 1)
    }
  }

  protected hit(amount: number, x: number, y: number): void {
    this.health -= amount
    if (this.health <= 0) {
      this.isDying = true
    } else {
      this.damaged()
      // TODO: ADD KNOCKBACK
      this.knockback(x, y, amount)
    }
  }

  protected kill(): void {
    this.anims.stop()
    this.body.setVelocity(0, 0)
    this.setAngle(-90)
    this.setPosition(this.x, this.y + this.body.height)
    this.setTint(0x9c9c9c)
    this.setActive(false)
    this.hurtBox.destroy()
    this.shadow.destroy()
    this.currentScene.time.delayedCall(1000, () => this.destroy())
  }

  protected damaged(): void {
    this.isInvincible = true
    this.currentScene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.5 },
      ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: this.damagedRate,
      repeat: 4, // -1: infinity
      yoyo: true,
      onYoyo: () => this.clearTint(),
      onStart: () => this.setTintFill(0xffffff),
      onRepeat: () => this.setTintFill(0xffffff),
      onComplete: () => {
        this.isInvincible = false
      },
    })
  }

  protected knockback(hitX: number, hitY: number, power: number = 1) {
    const dx = this.x - hitX
    const dy = this.y - hitY
    const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(power * 100)

    this.isDamaged = true
    this.currentScene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.5 },
      ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 50,
      repeat: 1, // -1: infinity
      onStart: () => this.body.setVelocity(direction.x, direction.y),
      onComplete: () => (this.isDamaged = false),
    })
  }
}
