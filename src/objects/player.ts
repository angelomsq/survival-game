import { Character } from './character'
import { ICharacter } from '../interfaces/character.interface'

interface IPlayer extends ICharacter {
  score: number
  level: number
}

export class Player extends Character {
  private keys: Map<string, Phaser.Input.Keyboard.Key>
  protected score: number
  protected level: number

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
    this.handleAnimation()
  }
}
