// import { ISprite } from '../interfaces/sprite.interface'

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  protected speed: number
  protected damage: number
  protected born: number
  direction: Phaser.Math.Vector2

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture)
    this.speed = 200
    this.damage = 1
    this.born = 0
    this.direction = new Phaser.Math.Vector2(0, 0)
  }

  getDamage() {
    return this.damage
  }

  fire() {
    this.setDisplaySize(12, 5)
    this.body.setSize(5, 5, true)
    this.anims.play('shoot', true)

    const angle = this.direction.angle()
    this.setRotation(angle)
    this.setVelocity(this.direction.x * this.speed, this.direction.y * this.speed)

    this.born = 0
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta)
    this.born += delta

    if (
      this.born > 1500 ||
      !Phaser.Geom.Rectangle.Overlaps(this.scene.physics.world.bounds, this.getBounds())
    ) {
      this.kill()
    }
  }

  kill() {
    let explosion = this.scene.add.sprite(this.x, this.y, 'explosion')
    explosion.anims.play('explode', true)
    explosion.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      function () {
        explosion.destroy()
      },
      this
    )
    this.setActive(false)
    this.setVisible(false)
    this.body.velocity.y = 0
    this.body.velocity.x = 0
    this.setPosition(0, 0)
  }
}
