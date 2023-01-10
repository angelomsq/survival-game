import { Character } from './character'
import { Player } from './player'
import { ICharacter } from '../interfaces/character.interface'
import { getRandomInt } from '../plugins/helpers'

interface IEnemy extends ICharacter {
  damage?: number
  level?: number
  target: Player | null
}

export class Enemy extends Character {
  protected damage: number
  protected level: number
  protected drops: string
  protected target: Player | null

  constructor(attributes: IEnemy) {
    super(attributes)
    this.damage = attributes.damage || 1
    this.level = attributes.level || 1
    this.drops = this.getRandomDrop()
    this.target = attributes.target || null
  }

  update(time: number, delta: number): void {
    super.update(time, delta)
    const moves = this.getMoves()
    // console.log(moves)
    // console.log(this.body.velocity)
    if (!this.isDying && !this.isDamaged) {
      if (moves.includes('LEFT') && this.body.velocity.x <= 0) {
        this.body.setVelocityX(-this.speed)
        if (this.body.velocity.y === 0) {
          this.direction = 'left'
        }
      } else if (moves.includes('RIGHT')) {
        this.body.setVelocityX(this.speed)
        if (this.body.velocity.y === 0) {
          this.direction = 'right'
        }
      } else {
        this.body.setVelocityX(0)
      }

      if (moves.includes('UP') && this.body.velocity.y <= 0) {
        this.body.setVelocityY(-this.speed)
        if (this.body.velocity.x === 0) {
          this.direction = 'up'
        }
      } else if (moves.includes('DOWN')) {
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
    }
  }

  protected getRandomDrop(): string {
    let dropTypes = [
      { name: 'empty', rate: [1, 30] },
      { name: 'fire', rate: [31, 40] },
      { name: 'heart', rate: [41, 50] },
      { name: 'coin', rate: [51, 100] },
    ]
    let randomPercent = getRandomInt(1, 100)
    const selected = dropTypes.filter(
      (item) => randomPercent >= item.rate[0] && randomPercent <= item.rate[1]
    )
    return selected[0].name
  }

  protected getMoves(): string[] {
    const targetPosition: Phaser.Math.Vector2 | undefined = this.target?.body.position
    let moves = []
    if (targetPosition) {
      if (
        Math.abs(this.body.x - targetPosition.x) < 100 ||
        Math.abs(this.body.y - targetPosition.y) < 100
      ) {
        if (Math.round(targetPosition.x + 1) < Math.round(this.body.x)) {
          moves.push('LEFT')
        }
        if (Math.round(targetPosition.x - 1) > Math.round(this.body.x)) {
          moves.push('RIGHT')
        }

        if (Math.round(targetPosition.y + 1) < Math.round(this.body.y)) {
          moves.push('UP')
        }
        if (Math.round(targetPosition.y - 1) > Math.round(this.body.y)) {
          moves.push('DOWN')
        }
      }
    }
    return moves
  }

  protected kill() {
    super.kill()
    this.dropItem()
  }

  protected dropItem(): void {
    if (this.drops !== 'empty') {
      this.currentScene.addItem(this.x, this.y, this.drops)
    }
  }
}
