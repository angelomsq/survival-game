import { ICharacter } from '../interfaces/character.interface'

export class Character extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body

  // variables
  protected currentScene: Phaser.Scene
  protected isActivated: boolean
  protected isDying: boolean
  protected isInvincible: boolean
  protected isAttacking: boolean
  protected speed: number
  protected health: number
  protected maxHealth: number
  protected maxBullets: number
  protected direction: string
  protected fireRate: number
  protected lastFired: number

  constructor(attributes: ICharacter) {
    super(attributes.scene, attributes.x, attributes.y, attributes.texture, attributes.frame)

    // variables
    this.currentScene = attributes.scene
    this.isActivated = false
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

    this.initSprite(attributes)
    this.currentScene.add.existing(this)
  }

  protected initSprite(attributes: ICharacter) {
    // sprite
    this.setOrigin(0, 0)
    this.setFrame(0)

    // physics
    this.currentScene.physics.world.enable(this)
    this.body.setSize(attributes.width, attributes.height)
    this.anims.play(`${this.texture.key}-idle-${this.direction}`)
  }

  update(time: number, delta: number): void {
    this.handleAnimation()
  }

  protected handleAnimation(): void {
    if (this.body.velocity.x != 0 || this.body.velocity.y != 0) {
      this.anims.play(`${this.texture.key}-walk-${this.direction}`, true)
    } else {
      this.anims.play(`${this.texture.key}-idle-${this.direction}`, true)
    }
  }
}
