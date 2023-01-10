export default class LoadScene extends Phaser.Scene {
  // graphics
  private loadingBar!: Phaser.GameObjects.Graphics
  private progressBar!: Phaser.GameObjects.Graphics

  constructor() {
    super({
      key: 'LoadScene',
    })
  }

  preload(): void {
    // set the background, create the loading and progress bar and init values
    // with the global data manager (= this.registry)
    this.cameras.main.setBackgroundColor(0x000000)
    this.createLoadingGraphics()

    // pass value to change the loading bar fill
    this.load.on(
      'progress',
      (value: number) => {
        this.progressBar.clear()
        this.progressBar.fillStyle(0x88e453, 1)
        this.progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        )
      },
      this
    )

    // delete bar graphics, when loading complete
    this.load.on(
      'complete',
      () => {
        this.progressBar.destroy()
        this.loadingBar.destroy()
        this.loadAnimations()
      },
      this
    )

    // load our package
    this.load.pack('preload', './assets/pack.json', 'preload')
  }

  update(): void {
    this.scene.start('GardenScene')
  }

  private createLoadingGraphics(): void {
    this.loadingBar = this.add.graphics()
    this.loadingBar.fillStyle(0xffffff, 1)
    this.loadingBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      20
    )
    this.progressBar = this.add.graphics()
  }

  private loadAnimations(): void {
    /**
     * PLAYER ANIMATIONS (idle/walk/attack)
     */
    let directions = ['left', 'right', 'up', 'down']
    let characters = [{ name: 'player', opt: ['idle', 'walk', 'atk', 'roll'] }]

    characters.map((char) => {
      char.opt.map((opt) => {
        directions.map((direction) => {
          this.anims.create({
            key: `${char.name}-${opt}-${direction}`,
            frameRate: 6,
            repeat: opt == 'idle' ? -1 : 0,
            frames: this.anims.generateFrameNames(`${char.name}`, {
              prefix: `${char.name}_${opt}_${direction}_`,
              start: 1,
              end: opt == 'atk' ? 2 : 4,
              zeroPad: 2,
            }),
          })
        })
      })
    })

    /**
     * ENEMIES ANIMATIONS
     */

    let enemies = [
      { name: 'skeleton', opt: ['idle', 'walk'] },
      { name: 'zombie', opt: ['idle', 'walk'] },
    ]

    enemies.map((enemy) => {
      enemy.opt.map((opt) => {
        directions.map((direction) => {
          this.anims.create({
            key: `${enemy.name}-${opt}-${direction}`,
            frameRate: 6,
            repeat: opt == 'idle' ? -1 : 0,
            frames: this.anims.generateFrameNames(`${enemy.name}`, {
              prefix: `${enemy.name}_${opt}_${direction}_`,
              start: 1,
              end: opt == 'atk' ? 4 : 4,
              zeroPad: 2,
            }),
          })
        })
      })
    })

    /**
     * POWER ANIMATIONS
     */

    this.anims.create({
      key: 'shoot',
      frameRate: 6,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNames('fireball', {
        prefix: 'fireball_',
        start: 1,
        end: 3,
        zeroPad: 2,
      }),
    })

    this.anims.create({
      key: 'explode',
      frameRate: 10,
      repeat: 0,
      yoyo: false,
      frames: this.anims.generateFrameNames('explosion', {
        prefix: 'explosion_',
        start: 1,
        end: 4,
        zeroPad: 2,
      }),
    })

    /**
     * ITEMS ANIMATION
     */

    this.anims.create({
      key: 'heart',
      repeat: -1,
      frameRate: 8,
      frames: this.anims.generateFrameNames('heart', {
        prefix: 'heart_',
        start: 1,
        end: 6,
        zeroPad: 2,
      }),
    })

    this.anims.create({
      key: 'fire',
      repeat: -1,
      yoyo: true,
      frameRate: 4,
      frames: this.anims.generateFrameNames('fire', {
        prefix: 'fire_',
        start: 1,
        end: 3,
        zeroPad: 2,
      }),
    })

    this.anims.create({
      key: 'coin',
      repeat: -1,
      frameRate: 8,
      frames: this.anims.generateFrameNames('coin', {
        prefix: 'coin_',
        start: 1,
        end: 11,
        zeroPad: 2,
      }),
    })
  }
}
