import { Character } from './character'
import { ICharacter } from '../interfaces/character.interface'
import { Bullet } from './bullet'

interface IPlayer extends ICharacter {
  score: number
  level: number
}

export class Player extends Character {
  private keys: Map<string, Phaser.Input.Keyboard.Key>
  protected score: number
  protected level: number
  protected scoreBar: Phaser.GameObjects.BitmapText
  protected healthHUD: Phaser.GameObjects.Sprite[]

  public getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
    return this.keys
  }

  private addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.currentScene.input.keyboard.addKey(key)
  }

  constructor(attributes: IPlayer) {
    super(attributes)
    this.score = 0
    this.level = 1

    this.scoreBar = this.currentScene.add
      .bitmapText(this.currentScene.cameras.main.width - 44, 8, 'CGPixelMini', '')
      .setScrollFactor(0)
      .setDepth(3)

    this.healthHUD = []

    // input
    this.keys = new Map([
      ['LEFT', this.addKey('LEFT')],
      ['RIGHT', this.addKey('RIGHT')],
      ['UP', this.addKey('UP')],
      ['DOWN', this.addKey('DOWN')],
      ['SHOOT', this.addKey('SPACE')],
    ])
  }

  update(time: number, delta: number): void {
    super.update(time, delta)
    this.getScore()
    this.getHealthHUD()
    if (!this.isDying) {
      if (this.keys.get('LEFT')?.isDown && this.body.velocity.x <= 0) {
        this.body.setVelocityX(-this.speed)
        if (this.body.velocity.y === 0) {
          this.direction = 'left'
        }
      } else if (this.keys.get('RIGHT')?.isDown) {
        this.body.setVelocityX(this.speed)
        if (this.body.velocity.y === 0) {
          this.direction = 'right'
        }
      } else {
        this.body.setVelocityX(0)
      }

      if (this.keys.get('UP')?.isDown && this.body.velocity.y <= 0) {
        this.body.setVelocityY(-this.speed)
        if (this.body.velocity.x === 0) {
          this.direction = 'up'
        }
      } else if (this.keys.get('DOWN')?.isDown) {
        this.body.setVelocityY(this.speed)
        if (this.body.velocity.x === 0) {
          this.direction = 'down'
        }
      } else {
        this.body.setVelocityY(0)
      }

      if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
        this.body.setVelocity(this.body.velocity.x * 0.69, this.body.velocity.y * 0.69)
      }

      if (this.keys.get('SHOOT')?.isDown && time > this.lastFired) {
        let bullet = this.bullets.getFirstDead(false) as Bullet
        if (bullet) {
          bullet.body.reset(this.x, this.y)
          bullet.setActive(true)
          bullet.setVisible(true)
          console.log('fetched bullet', bullet)

          if (this.direction === 'left') {
            if (this.keys.get('UP')?.isDown) {
              bullet.direction.set(-0.69, -0.69)
            } else if (this.keys.get('DOWN')?.isDown) {
              bullet.direction.set(-0.69, 0.69)
            } else {
              bullet.direction.set(-1, 0)
            }
          }
          if (this.direction === 'right') {
            if (this.keys.get('UP')?.isDown) {
              bullet.direction.set(0.69, -0.69)
            } else if (this.keys.get('DOWN')?.isDown) {
              bullet.direction.set(0.69, 0.69)
            } else {
              bullet.direction.set(1, 0)
            }
          }
          if (this.direction == 'up') {
            if (this.keys.get('LEFT')?.isDown) {
              bullet.direction.set(-0.69, -0.69)
            } else if (this.keys.get('RIGHT')?.isDown) {
              bullet.direction.set(0.69, -0.69)
            } else {
              bullet.direction.set(0, -1)
            }
          }
          if (this.direction == 'down') {
            if (this.keys.get('LEFT')?.isDown) {
              bullet.direction.set(-0.69, 0.69)
            } else if (this.keys.get('RIGHT')?.isDown) {
              bullet.direction.set(0.69, 0.69)
            } else {
              bullet.direction.set(0, 1)
            }
          }
          bullet.fire()
          this.lastFired = time + this.fireRate
        }
      }
    }
  }

  protected getHealthHUD(): void {
    let heartX, color
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.health) color = 'heartRed'
      else color = 'heartGray'

      heartX = i * 10 + 8

      if (this.healthHUD[i]) this.healthHUD[i].setTexture(color)
      else
        this.healthHUD.push(
          this.currentScene.add.sprite(heartX, 8, color).setScrollFactor(0).setDepth(3)
        )
    }
  }

  protected getScore(): void {
    this.scoreBar.setText(String(this.score).padStart(8, '0'))
  }
}
