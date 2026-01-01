import { CollisionBlock } from './js/classes/CollisionBlock.js';
import { Player } from './js/classes/Player.js';
import { Sprite } from './js/classes/Sprite.js';
import { AnimatedSprite } from './js/classes/AnimatedSprite.js';
import { Mob } from './js/classes/Mob.js';

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const VIEWPORT_WIDTH = 256;
const VIEWPORT_HEIGHT = 160;
const SCALE = 8;

const MAP_WIDTH = 512;
const MAP_HEIGHT = 320;

const GRAVITY_ACCELERATION_CONSTANT = 0.5;
const MOVEMENT_SPEED = 2;
const JUMP_VELOCITY = -6;

canvas.width = VIEWPORT_WIDTH * SCALE;
canvas.height = VIEWPORT_HEIGHT * SCALE;
ctx.imageSmoothingEnabled = false;

const camera = {
    x: 128,
    y: 80
};

let cameraShake = {
    intensity: 0,
    duration: 0,
    decay: 0.9
};

const collisionBlock = new CollisionBlock(MAP_WIDTH, MAP_HEIGHT, "./assets/map/collision.png");

const player = new Player({
    position: {x:150, y:120},
    ctx: ctx,
    collisionBlock: collisionBlock,
    gravity: GRAVITY_ACCELERATION_CONSTANT,
    jumpVelocity: JUMP_VELOCITY,
    imageSrc: "./assets/player/Idle-Sheet.png",
    frameRate: 4,
    animations: {
        Idle:{
            imageSrc: "./assets/player/Idle-Sheet.png",
            frameRate: 4,
            frameHold: 24,
            loop: true,
        },
        Run:{
            imageSrc: "./assets/player/Run-Sheet.png",
            frameRate: 8,
            frameHold: 6,
            loop: true,
        },
        Jump:{
            imageSrc: "./assets/player/Jump-Start-Sheet.png",
            frameRate: 4,
            frameHold: 1,
            loop: false,
        },
        Fall:{
            imageSrc: "./assets/player/Jump-End-Sheet.png",
            frameRate: 3,
            frameHold: 1,
            loop: false,
        },
        Attack:{
            imageSrc: "./assets/player/Attack-Sheet.png",
            frameRate: 5,
            frameHold: 5,
            loop: false,
            frameWidth: 96,
        },
    }
});

const swordWhooshSound = new Audio('./assets/audios/sword-whoosh.wav');
swordWhooshSound.volume = 0.5;

const fleshHitSound = new Audio('./assets/audios/flesh-hit.wav');
fleshHitSound.volume = 0.8;

const boarSquealSound = new Audio('./assets/audios/boar-squeal.wav');
boarSquealSound.volume = 1;

const runningWoodSound = new Audio('./assets/audios/running-wood.wav');
runningWoodSound.volume = 1;
runningWoodSound.loop = true;

let mobHitCount = 0;
let gameCompleted = false;

const keys = {
    d:{pressed:false},
    a:{pressed:false},
    w:{pressed:false},
    j:{pressed:false},
}

const background = new Sprite({
    position:{x:0, y:0},
    imageSrc:"./assets/map/map.png",
    ctx: ctx,
});

const mob = new Mob({
    position: {x: 290, y: 150},
    imageSrc: "./assets/mob/Idle-Sheet-White.png",
    ctx: ctx,
    frameRate: 4,
    frameHold: 10,
    loop: true,
    collisionBlock: collisionBlock,
    gravity: GRAVITY_ACCELERATION_CONSTANT,
    animations: {
        Idle: {
            imageSrc: "./assets/mob/Idle-Sheet-White.png",
            frameRate: 4,
            frameHold: 10,
            loop: true,
        },
        Hit: {
            imageSrc: "./assets/mob/Hit-Sheet-White.png",
            frameRate: 4,
            frameHold: 8,
            loop: false,
        },
    },
});

/**
 * Main game loop - Ngehandle rendering, updates, dan logika game per frame(?)
 * Ngeloop game sampe game selesai atau user nutup jendela
 */
function gameLoop(){
    window.requestAnimationFrame(gameLoop);
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // Reset status attack ketika animasi attack selesai (frame terakhir tercapai)
    if(player.isAttacking && player.currentFrame === player.frameRate - 1 && player.elapsedFrames >= player.frameHold - 1){
        player.isAttacking = false;
    }
    
    // Reset status hit mob setelah animasi hit selesai
    if(mob.isHit && mob.currentFrame === mob.frameRate - 1 && mob.elapsedFrames >= mob.frameHold - 1){
        mob.isHit = false;
    }
    

    // Cek apakah attack hitbox player bersinggungan dengan hitbox mob (AABB collision detection)
    if(player.isAttacking && !mob.isHit){
        if(
            // Cek overlap rectangle di keempat sisi
            player.attackHitbox.position.x < mob.hitbox.position.x + mob.hitbox.width &&
            player.attackHitbox.position.x + player.attackHitbox.width > mob.hitbox.position.x &&
            player.attackHitbox.position.y < mob.hitbox.position.y + mob.hitbox.height &&
            player.attackHitbox.position.y + player.attackHitbox.height > mob.hitbox.position.y
        ){
            mob.isHit = true;
            mobHitCount++;
            
            // Trigger efek guncangan kamera saat hit
            cameraShake.intensity = 4;
            cameraShake.duration = 8;
            
            fleshHitSound.currentTime = 0.5;
            fleshHitSound.play();
            boarSquealSound.currentTime = 0.5;
            boarSquealSound.play();
        }
    }
    
    player.velocity.x = 0;
    
    if(player.isAttacking){
        player.switchSprite('Attack');
        runningWoodSound.pause();
    }

    else if(keys.d.pressed){
        player.switchSprite('Run');
        player.velocity.x = MOVEMENT_SPEED;
        player.facingDirection = 1;
        if(runningWoodSound.paused && player.onGround){
            runningWoodSound.currentTime = 0.5;
            runningWoodSound.play();
        }
    }
    else if(keys.a.pressed){
        player.switchSprite('Run');
        player.velocity.x = -MOVEMENT_SPEED;
        player.facingDirection = -1;
        if(runningWoodSound.paused && player.onGround){
            runningWoodSound.currentTime = 0.5;
            runningWoodSound.play();
        }
    }else{
        player.switchSprite('Idle');
        runningWoodSound.pause();
    }


    if(!player.isAttacking){
        if(player.velocity.y < 0){
            player.switchSprite('Jump');
        }else if(player.velocity.y > 0){
            player.switchSprite('Fall');
        }
    }
    
    // Terapkan efek guncangan kamera dengan offset random yang berkurang seiring waktu
    let shakeX = 0;
    let shakeY = 0;
    if(cameraShake.duration > 0){
        shakeX = (Math.random() - 0.5) * cameraShake.intensity;  // Offset random antara -intensity/2 dan +intensity/2
        shakeY = (Math.random() - 0.5) * cameraShake.intensity;
        cameraShake.duration--;
        cameraShake.intensity *= cameraShake.decay;  // Kurangi intensitas guncangan secara bertahap
    }
    
    // Simpan state context, scale viewport, dan terapkan posisi kamera dengan shake
    ctx.save();
    ctx.scale(SCALE, SCALE);  // Scale dari resolusi native ke resolusi layar
    
    ctx.translate(-camera.x + shakeX, -camera.y + shakeY);  // Gerakkan kamera dengan offset shake
    
    background.update();
    
    if(mob.isHit){
        mob.switchSprite('Hit');
    } else {
        mob.switchSprite('Idle');
    }
    
    mob.update();
    player.update();
    
    ctx.restore();
    
    // Update animasi pengisian huruf berdasarkan jumlah hit (indikator progress visual)
    const letters = document.querySelectorAll('.revofun-title .letter');
    letters.forEach((letter, index) => {
        if(index < mobHitCount){
            letter.classList.add('filled');  // Isi huruf ketika hit yang sesuai tercapai
        } else {
            letter.classList.remove('filled');
        }
    });
    
    if(mobHitCount >= 7 && !gameCompleted){
        gameCompleted = true;
        setTimeout(() => {
            const modal = document.getElementById('victoryModal');
            const nameInput = document.getElementById('playerNameInput');
            const submitBtn = document.getElementById('submitNameBtn');
            
            modal.classList.add('show');
            nameInput.focus();
            
            const handleSubmit = () => {
                const playerName = nameInput.value.trim();
                
                if(!playerName){
                    nameInput.style.borderColor = '#ff0000';
                    nameInput.placeholder = 'Are you the Nameless One?';
                    return;
                }
                
                try {
                    localStorage.setItem('heroName', playerName);
                    window.location.href = 'pages/home.html';
                } catch (e) {
                    console.error('Storage not available:', e);
                    alert('Unable to save your name. Please check browser settings.');
                }
            };
            
            nameInput.addEventListener('input', () => {
                nameInput.style.borderColor = 'var(--color-primary)';
                nameInput.placeholder = 'Enter your name...';
            });
            
            submitBtn.addEventListener('click', handleSubmit);
            
            nameInput.addEventListener('keypress', (e) => {
                if(e.key === 'Enter'){
                    handleSubmit();
                }
            });
        }, 500);
    }
}

gameLoop();

window.addEventListener('keydown', (event) => {
switch(event.key){
    case 'd':
        keys.d.pressed = true
        break
    case 'a':
        keys.a.pressed = true
        break
    case 'w':
        if(player.onGround) {
            player.velocity.y = JUMP_VELOCITY;
        }
        break
    case 'j':
        if(!player.isAttacking){
            player.isAttacking = true;
            swordWhooshSound.currentTime = 0;
            swordWhooshSound.play();
        }
        break
}
})

window.addEventListener('keyup', (event) => {
    switch(event.key){
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'w':
            keys.w.pressed = false
            break
        case 'j':
            keys.j.pressed = false
            break
    }
})