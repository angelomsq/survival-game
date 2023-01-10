import { ISprite } from './sprite.interface'

export interface ICharacter extends ISprite {
  width: number
  height: number
  speed: number
  health: number
  maxHealth: number
  maxBullets: number
  fireRate: number
  damagedRate: number
  direction: string
  bullets: Phaser.GameObjects.Group
}
