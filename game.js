let game;
let rocket;
let cursors;
let walls;
let collectibles;
let enemies;
let triggerIcon;
let canOpenNotes = false;

function preload() {
  this.textures.generate('rocket', {
    data: ['..R..', '.RRR.', 'RRRRR'],
    pixelWidth: 8,
    palette: { R: '#ff0' }
  });
  this.textures.generate('trigger', {
    data: ['.TT.', 'TTTT', '.TT.'],
    pixelWidth: 12,
    palette: { T: '#0f0', '.': '#00000000' }
  });
  this.textures.generate('collect', {
    data: ['.C.', 'CCC', '.C.'],
    pixelWidth: 10,
    palette: { C: '#7ff' }
  });
  this.textures.generate('enemy', {
    data: ['.E.', 'EEE', '.E.'],
    pixelWidth: 10,
    palette: { E: '#f00' }
  });
  this.textures.generate('wall', {
    data: ['WW', 'WW'],
    pixelWidth: 24,
    palette: { W: '#444' }
  });
}

function create() {
  walls = this.physics.add.staticGroup();
  const layout = [
    '###########',
    '#.........#',
    '#.#####...#',
    '#...#.....#',
    '#...#..E..#',
    '#...#.....#',
    '#...#####.#',
    '#.........#',
    '###########'
  ];
  const cellSize = 48;
  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      const ch = layout[y][x];
      const px = x * cellSize + cellSize/2;
      const py = y * cellSize + cellSize/2;
      if (ch === '#') {
        walls.create(px, py, 'wall').setScale(cellSize / 24).refreshBody();
      }
      if (ch === '.') {
        collectibles = collectibles || this.physics.add.group();
        collectibles.create(px, py, 'collect').setScale(1.2);
      }
      if (ch === 'E') {
        enemies = enemies || this.physics.add.group();
        const e = enemies.create(px, py, 'enemy').setScale(1.4);
        e.setVelocity(50, 50).setBounce(1).setCollideWorldBounds(true);
      }
    }
  }

  rocket = this.physics.add.sprite(cellSize + cellSize/2, cellSize + cellSize/2, 'rocket').setScale(1.4);
  rocket.setCollideWorldBounds(true);
  this.physics.add.collider(rocket, walls);

  this.physics.add.overlap(rocket, collectibles, (r, c) => c.destroy());

  if (enemies) {
    this.physics.add.collider(enemies, walls);
    this.physics.add.collider(enemies, enemies);
    this.physics.add.overlap(rocket, enemies, (r, e) => {
      rocket.setPosition(cellSize + cellSize/2, cellSize + cellSize/2);
    });
  }

  cursors = this.input.keyboard.createCursorKeys();

  triggerIcon = this.add.image(760, 40, 'trigger').setScale(2).setOrigin(1, 0);
  triggerIcon.setInteractive();
  triggerIcon.on('pointerdown', () => {
    if (canOpenNotes) {
      showNotesOverlay();
    }
  });

  this.time.addEvent({
    delay: 200,
    callback: () => {
      const d = Phaser.Math.Distance.Between(rocket.x, rocket.y, triggerIcon.x, triggerIcon.y);
      canOpenNotes = (d < 80);
    },
    loop: true
  });
}

function update() {
  const speed = 160;
  rocket.setVelocity(0);

  if (cursors.left.isDown) rocket.setVelocityX(-speed);
  if (cursors.right.isDown) rocket.setVelocityX(speed);
  if (cursors.up.isDown) rocket.setVelocityY(-speed);
  if (cursors.down.isDown) rocket.setVelocityY(speed);
}

// UI + Notizen

const overlay = document.getElementById('notes-overlay');
const pwSetup = document.getElementById('pw-setup');
const pwEnter = document.getElementById('pw-enter');
const notesArea = document.getElementById('notes-area');
const pwNew = document.getElementById('pw-new');
const pwSet = document.getElementById('pw-set');
const pwEnterInput = document.getElementById('pw-enter-input');
const pwUnlock = document.getElementById('pw-unlock');
const noteText = document.getElementById('note-text');
const saveNote = document.getElementById('save-note');
const closeBtn = document.getElementById('close-notes');

closeBtn.onclick = () => overlay.classList.add('hidden');

function showNotesOverlay() {
  overlay.classList.remove('hidden');
  const hasPw = localStorage.getItem('pw');
  if (!hasPw) {
    pwSetup.classList.remove('hidden');
    pwEnter.classList.add('hidden');
    notesArea.classList.add('hidden');
  } else {
    pwSetup.classList.add('hidden');
    pwEnter.classList.remove('hidden');
    notesArea.classList.add('hidden');
  }
}

pwSet.onclick = () => {
  const pw = pwNew.value;
  if (pw.length < 3) {
    alert('Passwort zu kurz');
    return;
  }

  localStorage.setItem('pw', pw);
  localStorage.setItem('notes', '');
  pwNew.value = '';

  // Direkt zu Notizen springen
  pwSetup.classList.add('hidden');
  notesArea.classList.remove('hidden');
  noteText.value = '';
};

pwUnlock.onclick = () => {
  const pw = pwEnterInput.value;
  if (pw === localStorage.getItem('pw')) {
    noteText.value = localStorage.getItem('notes') || '';
    pwEnter.classList.add('hidden');
    notesArea.classList.remove('hidden');
  } else {
    alert('Falsches Passwort');
  }
};

saveNote.onclick = () => {
  localStorage.setItem('notes', noteText.value);
  alert('Notizen gespeichert');
};

window.onload = () => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000',
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: { preload, create, update }
  });
};
