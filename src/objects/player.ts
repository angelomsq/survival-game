import { Character } from './character'
import { ICharacter } from '../interfaces/character.interface'
import { Bullet } from './bullet'

import { sceneEvents } from '../events'

interface IPlayer extends ICharacter {
  score: number
  level: number
}

export class Player extends Character {
  private keys: Map<string, Phaser.Input.Keyboard.Key>
  public score: number
  protected level: number
  protected scoreBar: Phaser.GameObjects.BitmapText
  protected isRolling: boolean
  protected rollingTime: number
  protected lastRoll: number

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
    this.isRolling = false
    this.rollingTime = 1500
    this.lastRoll = 0

    this.scoreBar = this.currentScene.add
      .bitmapText(this.currentScene.cameras.main.width - 44, 8, 'CGPixelMini', '')
      .setScrollFactor(0)
      .setDepth(3)

    // input
    this.keys = new Map([
      ['LEFT', this.addKey('LEFT')],
      ['RIGHT', this.addKey('RIGHT')],
      ['UP', this.addKey('UP')],
      ['DOWN', this.addKey('DOWN')],
      ['SHOOT', this.addKey('A')],
      ['ROLL', this.addKey('S')],
      ['PAUSE', this.addKey('ESC')],
    ])
  }

  update(time: number, delta: number): void {
    if (!this.isDying) {
      super.update(time, delta)
      this.getScore()
      if (Phaser.Input.Keyboard.JustDown(this.keys.get('PAUSE') as Phaser.Input.Keyboard.Key)) {
        if (this.currentScene.scene.isPaused()) {
          this.currentScene.scene.resume()
        } else {
          this.currentScene.scene.pause()
        }
      }

      if (this.scene.time.now >= this.lastRoll - 1000) {
        this.isRolling = false
      }

      if (!this.isRolling && !this.isDamaged) {
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

        if (
          Phaser.Input.Keyboard.JustDown(this.keys.get('ROLL') as Phaser.Input.Keyboard.Key) &&
          this.scene.time.now > this.lastRoll
        ) {
          if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            // console.log('roll')
            this.isRolling = true
            this.lastRoll = this.scene.time.now + this.rollingTime

            if (this.direction === 'left' && this.keys.get('LEFT')?.isDown) {
              //roll left
              this.body.setVelocity(-this.speed * 3, 0)
            }
            if (this.direction === 'right' && this.keys.get('RIGHT')?.isDown) {
              //roll right
              this.body.setVelocity(this.speed * 3, 0)
            }
            if (this.direction === 'up' && this.keys.get('UP')?.isDown) {
              //roll up
              this.body.setVelocity(0, -this.speed * 3)
            }
            if (this.direction === 'down' && this.keys.get('DOWN')?.isDown) {
              //roll down
              this.body.setVelocity(0, this.speed * 3)
            }
          }
        }

        if (this.keys.get('SHOOT')?.isDown && this.scene.time.now > this.lastFired) {
          let bullet = this.bullets.getFirstDead(false) as Bullet
          if (bullet) {
            bullet.body.reset(this.x, this.y)
            bullet.setActive(true)
            bullet.setVisible(true)

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
      sceneEvents.emit('player-bullets', this.bullets.countActive(false))
    }
  }

  protected handleAnimation(): void {
    if (!this.isDying) {
      if (!this.isRolling) {
        if (this.body.velocity.x != 0 || this.body.velocity.y != 0) {
          this.anims.play(`${this.texture.key}-walk-${this.direction}`, true)
        } else {
          this.anims.play(`${this.texture.key}-idle-${this.direction}`, true)
        }
      } else {
        this.anims.play(`${this.texture.key}-roll-${this.direction}`, true)
      }
    } else {
      this.kill()
    }
  }

  protected getScore(): void {
    this.scoreBar.setText(String(this.score).padStart(8, '0'))
  }
}
