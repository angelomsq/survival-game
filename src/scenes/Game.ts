import Phaser from 'phaser'
import Player from '../models/Player'

import MapTiled from '../assets/survival_tileset_extruded.png'
import MapTiledJSON from '../assets/survival.json'

import PlayerAtlas from '../assets/char/sprites.png'
import PlayerAtlasJSON from '../assets/char/sprites.json'

export default class GameScene extends Phaser.Scene {
  layers: { [key: string]: Phaser.Tilemaps.TilemapLayer }
  enemies: {}
  items: {}
  gamePaused: boolean
  mapWidth: any
  mapHeight: any
  playerGroup!: Phaser.Physics.Arcade.Group
  playerHurtboxGroup!: Phaser.Physics.Arcade.Group
  playerBulletGroup!: Phaser.Physics.Arcade.Group
  enemyGroup!: Phaser.Physics.Arcade.Group
  enemyHurtboxGroup!: Phaser.Physics.Arcade.Group
  enemyVisionRadiusGroup!: Phaser.Physics.Arcade.Group
  itemGroup!: Phaser.Physics.Arcade.Group
  map!: Phaser.Tilemaps.Tilemap
  tileset!: Phaser.Tilemaps.Tileset
  collisionsLayer!: Phaser.GameObjects.GameObject[]
  player!: Player
  constructor() {
    super('GameScene')
    this.mapWidth = 640
    this.mapHeight = 640
    this.layers = {}
    this.enemies = {}
    this.items = {}
    this.gamePaused = false
  }

  preload() {
    // this.load.image('logo', 'assets/phaser3-logo.png')
    this.load.image('tiles', MapTiled)
    this.load.tilemapTiledJSON('map', MapTiledJSON)
    this.load.atlas('char', PlayerAtlas, PlayerAtlasJSON)
  }

  create() {
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight).centerToBounds()
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight)

    //GROUPS
    this.playerGroup = this.physics.add.group()
    this.playerHurtboxGroup = this.physics.add.group()
    this.playerHurtboxGroup = this.physics.add.group()
    this.playerBulletGroup = this.physics.add.group({ active: false, visible: false })

    this.enemyGroup = this.physics.add.group()
    this.enemyHurtboxGroup = this.physics.add.group()
    this.enemyVisionRadiusGroup = this.physics.add.group()
    this.enemyHurtboxGroup = this.physics.add.group()
    this.itemGroup = this.physics.add.group()

    const tileset = {
      name: 'survival_tileset_extruded',
      key: 'tiles',
      width: 16,
      height: 16,
      margin: 1,
      spacing: 2,
    }

    //MAP
    this.map = this.add.tilemap('map')
    this.tileset = this.map.addTilesetImage(
      tileset.name,
      tileset.key,
      tileset.width,
      tileset.height,
      tileset.margin,
      tileset.spacing
    )

    //LAYERS
    // console.log(this.map);
    let count = 0
    this.map.layers.map((layer) => {
      // console.log(layer)
      this.layers[layer.name] = this.map.createLayer(layer.name, [this.tileset], 0, 0)
      this.layers[layer.name].setCollisionByProperty({ collides: true })
      this.physics.add.collider(this.playerGroup, this.layers[layer.name])
      this.layers[layer.name].setDepth(count)
      count++
    })

    this.map.objects.map((layer) => {
      if (layer.name == 'collisions') {
        this.collisionsLayer = this.map.createFromObjects(layer.name, layer.objects[0])
        console.log(this.collisionsLayer)
        this.collisionsLayer.forEach((wall, index) => {
          // console.log(wall)
          wall.width = wall.width * wall._scaleX
          wall.height = wall.height * wall._scaleY
          this.physics.world.enable(wall)
          wall.body.immovable = true
          wall.visible = false
        })
      }
    })
    //This loads the collision tree, needed for overlapRect() on this.safePosition()
    this.physics.world.step(0)

    /**
     * PLAYER ANIMATIONS (idle/walk/attack)
     */
    let directions = ['left', 'right', 'up', 'down']
    let chars = [{ name: 'char', opt: ['idle', 'walk', 'atk'] }]

    chars.map((char) => {
      char.opt.map((opt) => {
        directions.map((direction) => {
          this.anims.create({
            key: `${char.name}-${opt}-${direction}`,
            frameRate: 8,
            repeat: opt == 'idle' ? -1 : 0,
            frames: this.anims.generateFrameNames(`${char.name}`, {
              prefix: `${char.name}_${opt}_${direction}_`,
              start: 1,
              end: opt == 'atk' ? 4 : 6,
              zeroPad: 2,
            }),
          })
        })
      })
    })

    let playerConfig = {
      scene: this,
      image: 'char',
      w: 10,
      h: 16,
      x: 320,
      y: 320,
      type: 1,
      health: 5,
      maxHealth: 5,
      speed: 80,
      maxBullets: 1,
      fireRate: 300,
      direction: 'down',
    }

    this.player = new Player(this, playerConfig)
    this.player.setDepth(5)

    this.playerGroup.add(this.player)
    this.playerHurtboxGroup.add(this.player.hurtbox)

    this.playerGroup.setDepth(5)

    //stop player when arrows are not pressed
    this.input.keyboard.on('keyup', (event) => {
      if (event.keyCode >= 37 && event.keyCode <= 40 && !this.player.attacking) {
        this.player.stop()
      }
    })
  }

  update(time: number, delta: number) {
    if (!this.gamePaused) this.player.update(time, delta)
    // this.textHUD.setText(this.player.getScore()); // set the text to show the current score

    // this.enemyGroup.getChildren().map( enemy => {
    //   enemy.update(time, delta);
    // })

    // let overlap = 'No';
    // var pointer = this.input.activePointer;
    // if(this.physics.overlapRect(pointer.worldX, pointer.worldY, 10, 10, true, true).length) overlap = 'Yes';
    // this.textclick.setText([
    //     'x: ' + this.cameras.main.centerX,
    //     'y: ' + this.cameras.main.centerY,
    //     'isDown: ' + pointer.isDown,
    //     'overlap: ' + this.physics.overlapRect(pointer.worldX, pointer.worldY, 10, 10, true, true).length
    // ]);
  }
}
