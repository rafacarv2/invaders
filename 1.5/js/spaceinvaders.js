/*
 spaceinvaders.js
 */


//  Creates an instance of the Game class.
function Game() {

    //  Set the initial config.
    this.config = {
        bombRate: 0,
        bombMinVelocity: 100,
        bombMaxVelocity: 150,
        invaderInitialVelocity: 50,
//        invaderInitialVelocity: 0,
        invaderAcceleration: 20,
        invaderDropDistance: 20,
        rocketVelocity: 300,
        rocketMaxFireRate: 1,
        gameWidth: 1280,
        gameHeight: 720,
        fps: 150,
        debugMode: true,
        invaderRanks: 8,
        invaderFiles: 15,
        shipSpeed: 350,
        levelDifficultyMultiplier: 0.2,
        PontosPorInvader: 5
    };

    //  All state is in the variables below.
    this.lives = 3;
    this.width = 0;
    this.height = 0;
    this.gameBounds = {left: 0, top: 0, right: 0, bottom: 0};
    this.intervalId = 0;
    this.score = 0;
    this.level = 1;

    //  The state stack.
    this.stateStack = [];

    //  Input/output
    this.pressedKeys = {};
    this.gameCanvas = null;

    //  All sounds.
    this.sounds = null;
}

//  Initialise the Game with a canvas.
Game.prototype.initialise = function(gameCanvas) {

    //  Set the game canvas.
    this.gameCanvas = gameCanvas;

    //  Set the game width and height.
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    //  Set the state game bounds.
    this.gameBounds = {
        left: gameCanvas.width / 2 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2 + this.config.gameWidth / 2,
        top: gameCanvas.height / 2 - this.config.gameHeight / 2,
        bottom: gameCanvas.height / 2 + this.config.gameHeight / 2
    };

};

Game.prototype.moveToState = function(state) {

    //  If we are in a state, leave it.
    if (this.currentState() && this.currentState().leave) {
        this.currentState().leave(game);
        this.stateStack.pop();
    }

    //  If there's an enter function for the new state, call it.
    if (state.enter) {
        state.enter(game);
    }

    //  Set the current state.
    this.stateStack.pop();
    this.stateStack.push(state);
};

//  Start the Game.
Game.prototype.start = function() {

    //  Move into the 'welcome' state.
    this.moveToState(new WelcomeState());

    //  Set the game variables.
    this.lives = 3;
    this.config.debugMode = /debug=true/.test(window.location.href);

    //  Start the game loop.
    var game = this;
    this.intervalId = setInterval(function() {
        GameLoop(game);
    }, 1000 / this.config.fps);

};

//  Returns the current state.
Game.prototype.currentState = function() {
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};

//  Mutes or unmutes the game.
Game.prototype.mute = function(mute) {

    //  If we've been told to mute, mute.
    if (mute === true) {
        this.sounds.mute = true;
    } else if (mute === false) {
        this.sounds.mute = false;
    } else {
        // Toggle mute instead...
        this.sounds.mute = this.sounds.mute ? false : true;
    }
};

//  The main loop.
function GameLoop(game) {

    var currentState = game.currentState();
    if (currentState) {

        //  Delta t is the time to update/draw.
        var dt = 1 / game.config.fps;

        //  Get the drawing context.
        var ctx = this.gameCanvas.getContext("2d");

        //  Update if we have an update function. Also draw
        //  if we have a draw function.
        if (currentState.update) {
            currentState.update(game, dt);
        }
        if (currentState.draw) {
            currentState.draw(game, dt, ctx);
        }
    }
}

Game.prototype.pushState = function(state) {

    //  If there's an enter function for the new state, call it.
    if (state.enter) {
        state.enter(game);
    }
    //  Set the current state.
    this.stateStack.push(state);
};

Game.prototype.popState = function() {

    //  Leave and pop the state.
    if (this.currentState()) {
        if (this.currentState().leave) {
            this.currentState().leave(game);
        }

        //  Set the current state.
        this.stateStack.pop();
    }
};

//  The stop function stops the game.
Game.prototype.stop = function Stop() {
    clearInterval(this.intervalId);
};

//  Inform the game a key is down.
Game.prototype.keyDown = function(keyCode) {
    this.pressedKeys[keyCode] = true;
    //  Delegate to the current state too.
    if (this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, keyCode);
    }
};

//  Inform the game a key is up.
Game.prototype.keyUp = function(keyCode) {
    delete this.pressedKeys[keyCode];
    //  Delegate to the current state too.
    if (this.currentState() && this.currentState().keyUp) {
        this.currentState().keyUp(this, keyCode);
    }
};

function WelcomeState() {

}

WelcomeState.prototype.enter = function(game) {

    // Create and load the sounds.
    game.sounds = new Sounds();
    game.sounds.init();
    game.sounds.loadSound('shoot', '../sounds/shoot.wav');
    game.sounds.loadSound('bang', '../sounds/bang.wav');
    game.sounds.loadSound('explosion', '../sounds/explosion.wav');
};

WelcomeState.prototype.update = function(game, dt) {


};

WelcomeState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "30px ps2";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    ctx.fillText("JS Invaders!!", game.width / 2, game.height / 2 - 40);
    ctx.font = "16px ps2";

    ctx.fillText("Aperte espaço para começar.", game.width / 2, game.height / 2);

};

WelcomeState.prototype.keyDown = function(game, keyCode) {
    if (keyCode == 32) /*space*/ {
        //  Space starts the game.
        game.level = 1;
        game.score = 0;
        game.lives = 3;
        game.moveToState(new LevelIntroState(game.level));
    }
};

function GameOverState() {

}

GameOverState.prototype.update = function(game, dt) {

};

GameOverState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "30px ps2";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", game.width / 2, game.height / 2 - 40);
    ctx.font = "16px ps2";
    ctx.fillText("Fez " + game.score + " pontos e chegou até a fase " + game.level, game.width / 2, game.height / 2);
    ctx.font = "16px ps2";
    ctx.fillText("Aperte espaço para jogar denovo.", game.width / 2, game.height / 2 + 40);
};

GameOverState.prototype.keyDown = function(game, keyCode) {
    if (keyCode == 32) /*space*/ {
        //  Space restarts the game.
        game.lives = 3;
        game.score = 0;
        game.level = 1;
        game.moveToState(new LevelIntroState(1));
    }
};

function VictoryState() {

}

VictoryState.prototype.update = function(game, dt) {

};

VictoryState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "30px ps2";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    ctx.fillText("Vitória!", game.width / 2, game.height / 2 - 40);
    ctx.font = "16px ps2";
    ctx.fillText("Derrotou a nave mãe e fez " + game.score + " pontos. Parabéns", game.width / 2, game.height / 2);
    ctx.font = "16px ps2";
//    ctx.fillText("Aperte espaço para jogar denovo.", game.width / 2, game.height / 2 + 40);
};

VictoryState.prototype.keyDown = function(game, keyCode) {
    if (keyCode == 32) /*space*/ {
        //  Space restarts the game.
//        game.lives = 3;
//        game.score = 0;
//        game.level = 1;
//        game.moveToState(new LevelIntroState(1));
    }
};

//  Create a PlayState with the game config and the level you are on.
function PlayState(config, level) {
    this.config = config;
    this.level = level;

    //  Game state.
    this.invaderCurrentVelocity = 10;
    this.invaderCurrentDropDistance = 0;
    this.invadersAreDropping = false;
    this.lastRocketTime = null;

    //  Game entities.
    this.ship = null;
    this.invaders = [];
    this.rockets = [];
    this.bombs = [];
    this.medidor = null;
}

PlayState.prototype.enter = function(game) {

    //  Create the ship.
    this.ship = new Ship(game.width / 2, game.gameBounds.bottom-20, 100);

    // Cria o medidor de forca
    this.medidor = new Medidor(100);

    //  Setup initial state.
    this.invaderCurrentVelocity = 10;
    this.invaderCurrentDropDistance = 0;
    this.invadersAreDropping = false;

    //  Set the ship speed for this level, as well as invader params.
    var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
    this.shipSpeed = this.config.shipSpeed;
    this.invaderInitialVelocity = this.config.invaderInitialVelocity + (levelMultiplier * this.config.invaderInitialVelocity);
    this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
    this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
    this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);

    //  Create the invaders.
    var linhas = this.config.invaderRanks;
    var files = this.config.invaderFiles;
    var invaders = [];
    for (var linha = 0; linha < linhas; linha++) {
        var tipo = (Math.round((Math.random() * 2) + 1));
        for (var file = 0; file < files; file++) {
            invaders.push(new Invader(
                    (game.width / 2) + ((files / 2 - file) * 700 / files),
                    (game.gameBounds.top+20 + linha * 40),
                    linha, 3, file, tipo));
        }
    }
    this.invaders = invaders;
    this.invaderCurrentVelocity = this.invaderInitialVelocity;
    this.invaderVelocity = {x: -this.invaderInitialVelocity, y: 0};
    this.invaderNextVelocity = null;
};

PlayState.prototype.update = function(game, dt) {
    //  If the left or right arrow keys are pressed, move
    //  the ship. Check this on ticks rather than via a keydown
    //  event for smooth movement, otherwise the ship would move
    //  more like a text editor caret.
    this.ship.animacao = 1;
    if (game.pressedKeys[37]) {
        this.ship.x -= this.shipSpeed * dt;
        this.ship.animacao = 0;
    }
    if (game.pressedKeys[39]) {
        this.ship.x += this.shipSpeed * dt;
        this.ship.animacao = 2;
    }
    if (game.pressedKeys[32]) {
        this.fireRocket();
    } else {
        if (this.ship.forca < 100)
            this.ship.forca += 1;

    }

    //  Keep the ship in bounds.
    if (this.ship.x < game.gameBounds.left) {
        this.ship.x = game.gameBounds.left;
    }
    if (this.ship.x > game.gameBounds.right-20) {
        this.ship.x = game.gameBounds.right-20;
    }

    //  Move each bomb.
    for (var i = 0; i < this.bombs.length; i++) {
        var bomb = this.bombs[i];
        bomb.y += dt * bomb.velocity;

        //  If the rocket has gone off the screen remove it.
        if (bomb.y > this.height) {
            this.bombs.splice(i--, 1);
        }
    }

    //  Move each rocket.
    for (i = 0; i < this.rockets.length; i++) {
        var rocket = this.rockets[i];
        rocket.y -= dt * rocket.velocity;

        //  If the rocket has gone off the screen remove it.
        if (rocket.y < 0) {
            this.rockets.splice(i--, 1);
        }
    }

    //  Move the invaders.
    var hitLeft = false, hitRight = false, hitBottom = false;
    for (i = 0; i < this.invaders.length; i++) {
        var invader = this.invaders[i];
        var newx = invader.x + this.invaderVelocity.x * dt;
        var newy = invader.y + this.invaderVelocity.y * dt;
        if (hitLeft == false && newx < game.gameBounds.left+30) {
            hitLeft = true;
        }
        else if (hitRight == false && newx > game.gameBounds.right-30) {
            hitRight = true;
        }
        else if (hitBottom == false && newy > game.gameBounds.bottom) {
            hitBottom = true;
        }

        if (!hitLeft && !hitRight && !hitBottom) {
            invader.x = newx;
            invader.y = newy;
        }
    }

    //  Update invader velocities.
    if (this.invadersAreDropping) {
        this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
        if (this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
            this.invadersAreDropping = false;
            this.invaderVelocity = this.invaderNextVelocity;
            this.invaderCurrentDropDistance = 0;
        }
    }
    //  If we've hit the left, move down then right.
    if (hitLeft) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y: this.invaderCurrentVelocity};
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: this.invaderCurrentVelocity, y: 0};
    }
    //  If we've hit the right, move down then left.
    if (hitRight) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y: this.invaderCurrentVelocity};
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: -this.invaderCurrentVelocity, y: 0};
    }
    //  If we've hit the bottom, it's game over.
    if (hitBottom) {
        this.lives = 0;
    }

    //  Check for rocket/invader collisions.
    for (i = 0; i < this.invaders.length; i++) {
        var invader = this.invaders[i];
        var bang = false;

        for (var j = 0; j < this.rockets.length; j++) {
            var rocket = this.rockets[j];

            if (rocket.x >= (invader.x - invader.width / 2) && rocket.x <= (invader.x + invader.width / 2) &&
                    rocket.y >= (invader.y - invader.height / 2) && rocket.y <= (invader.y + invader.height / 2)) {

                //  Remove the rocket, set 'bang' so we don't process
                //  this rocket again.
                this.rockets.splice(j--, 1);
                bang = true;
                game.score += this.config.PontosPorInvasor;
                break;
            }
        }
        if (bang) {
            if (invader.shield <= 1) {
                this.invaders.splice(i--, 1);
            } else {
                invader.shield -= 1;
            }
            if (this.bombRate < 0.8) {
                this.bombRate = this.bombRate + 0.05;
            }
            game.sounds.playSound('bang');
        }
    }

    //  Find all of the front linha invaders.
    var InvaderVanguarda = {};
    for (var i = 0; i < this.invaders.length; i++) {
        var invader = this.invaders[i];
        //  If we have no invader for game file, or the invader
        //  for game file is futher behind, set the front
        //  linha invader to game one.
        if (!InvaderVanguarda[invader.file] || InvaderVanguarda[invader.file].linha < invader.linha) {
            InvaderVanguarda[invader.file] = invader;
        }
    }

    //  Give each front linha invader a chance to drop a bomb.
    for (var i = 0; i < this.config.invaderFiles; i++) {
        var invader = InvaderVanguarda[i];
        if (!invader)
            continue;
        var chance = this.bombRate * dt;
        if (chance > Math.random()) {
            //  Fire!
            this.bombs.push(new Bomb(invader.x, invader.y + invader.height / 2,
                    this.bombMinVelocity + Math.random() * (this.bombMaxVelocity - this.bombMinVelocity)));
        }
    }

    //  Check for bomb/ship collisions.
    for (var i = 0; i < this.bombs.length; i++) {
        var bomb = this.bombs[i];
        if (bomb.x >= (this.ship.x - this.ship.width / 2) && bomb.x <= (this.ship.x + this.ship.width / 2) &&
                bomb.y >= (this.ship.y - this.ship.height / 2) && bomb.y <= (this.ship.y + this.ship.height / 2)) {
            this.bombs.splice(i--, 1);
            game.lives--;
            game.sounds.playSound('explosion');
        }
    }

    //  Check for invader/ship collisions.
    for (var i = 0; i < this.invaders.length; i++) {
        var invader = this.invaders[i];
        if ((invader.x + invader.width / 2) > (this.ship.x - this.ship.width / 2) &&
                (invader.x - invader.width / 2) < (this.ship.x + this.ship.width / 2) &&
                (invader.y + invader.height / 2) > (this.ship.y - this.ship.height / 2) &&
                (invader.y - invader.height / 2) < (this.ship.y + this.ship.height / 2)) {
            //  Dead by collision!
            game.lives = 0;
            game.sounds.playSound('explosion');
        }
    }


    //  Check for failure
    if (game.lives <= 0) {
        game.moveToState(new GameOverState());
    }

    //  Check for victory
    if (this.invaders.length === 0) {

        game.score += this.level * 50;
        game.level += 1;
        if (game.level > 1) {
            game.moveToState(new VictoryState(game.level));
        } else {
            game.moveToState(new LevelIntroState(game.level));
        }
    }
};

PlayState.prototype.draw = function(game, dt, ctx) {
    frame++;
    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    //  Desenha jogador.
    //versao retangulo comentada
    /*ctx.fillStyle = '#0011ff';
     ctx.fillRect(
     this.ship.x - (this.ship.width / 2),
     this.ship.y - (this.ship.height / 2),
     this.ship.width, this.ship.height);*/
    var shipSX;
    switch (this.ship.animacao) {
        case 0:
            shipSX = 0;
            break;
        case 1:
            shipSX = 32;
            break;
        case 2:
            shipSX = 66;
            break;

    }
    console.log(this.ship.animacao);
    ctx.drawImage(
            invaderIMG, //img
            shipSX, 181, //sx,sy
            this.ship.width, this.ship.height, //swidth,sheight
            this.ship.x - (this.ship.width / 2), this.ship.y - (this.ship.height / 2), //x,y
            this.ship.width, this.ship.height//width,height
            );



    //Desenha medidor de forca
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(game.gameBounds.right-20, (game.gameBounds.bottom/2)-20, 15, 200);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(game.gameBounds.right-20, (game.gameBounds.bottom/2)-20, 15, this.ship.forca * 2);
//    
    var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14;
    ctx.font = "8px ps2";
    ctx.fillStyle = '#000';
//    var info = "Vidas: " + game.lives + ", Força do laser: 10";
    var info = "Força do Laser";
    ctx.textAlign = "left";
    ctx.fillText(info, game.gameBounds.right - 200, textYpos);



    //  Draw invaders.
    for (var i = 0; i < this.invaders.length; i++) {

        var invader = this.invaders[i];
//        var sx;
//        var corInvader;
        switch (invader.shield) {
            case 4 :
                corInvader = '#fff';
                break;
            case 3 :
                //azuis
                corInvader = '0';
//                corInvader = '#0000ff';
                break;
            case 2 :
                //vermelhos
                corInvader = '36';
//                corInvader = '#ff0000';
                break;
            case 1 :
                //verdes
                corInvader = '72';
//                corInvader = '#00ff00';
                break;
        }
        switch (invader.tipo) {
            case 1:
                invaderFrameA = 0;
                invaderFrameB = 48;
                break;
            case 2:
                invaderFrameA = 96;
                invaderFrameB = 144;
                break;
            case 3:
                invaderFrameA = 192;
                invaderFrameB = 240;
                break;
        }

        if (frame < 25) {
            sx = invaderFrameA;
        } else {
            sx = invaderFrameB;
            if (frame > 49) {
                frame = 0;
            }
        }

        ctx.drawImage(
                invaderIMG, //img
                sx, corInvader, //sx,sy
                invader.width, invader.height, //swidth,sheight
                invader.x - invader.width / 2, invader.y - invader.height / 2, //x,y
                invader.width, invader.height//width,height
                );
//        ctx.fillStyle = corInvader;
//        ctx.fillRect(invader.x - invader.width / 2, invader.y - invader.height / 2, invader.width, invader.height);
    }

    //  Draw bombs.
    ctx.fillStyle = '#ff5555';
    for (var i = 0; i < this.bombs.length; i++) {
        var bomb = this.bombs[i];
        ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
    }

    //  Draw rockets.
    ctx.fillStyle = '#ff0000';
    for (var i = 0; i < this.rockets.length; i++) {
        var rocket = this.rockets[i];
        ctx.fillRect(rocket.x, rocket.y - 2, 4, 4);
    }

    //  Draw info.
    var textYpos = game.gameBounds.bottom -50;
    ctx.font = "16px ps2";
    ctx.fillStyle = '#ffffff';
//    var info = "Vidas: " + game.lives + ", Força do laser: 10";
    var info = "Vidas: " + game.lives;
    ctx.textAlign = "left";
    ctx.fillText(info, game.gameBounds.left, textYpos);
//    info = "Score: " + game.score + ", Fase: " + game.level;
    info = "Score: " + game.score;
    ctx.textAlign = "right";
    ctx.fillText(info, game.gameBounds.right, 20);

    //  If we're in debug mode, draw bounds.
    if (this.config.debugMode) {
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(0, 0, game.width, game.height);
        ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
                game.gameBounds.right - game.gameBounds.left,
                game.gameBounds.bottom - game.gameBounds.top);
    }

};

PlayState.prototype.keyDown = function(game, keyCode) {

    if (keyCode == 32) {
        //  Fire!
        this.fireRocket();
    }
    if (keyCode == 80) {
        //  Push the pause state.
        document.getElementById('audio').pause();
        starfield.stop();
        this.bombs = [];
        game.pushState(new PauseState());
    }
};

PlayState.prototype.keyUp = function(game, keyCode) {
//if(this.ship.forca <100){this.ship.forca+=20;}
};

PlayState.prototype.fireRocket = function() {
    //  If we have no last rocket time, or the last rocket time 
    //  is older than the max rocket rate, we can fire.
    if (this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / (this.ship.forca / 15 + this.config.rocketMaxFireRate)))
    {
        if (this.ship.forca > 0) {
            this.ship.forca -= 1;
        }
        //  Add a rocket.
        this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
        this.lastRocketTime = (new Date()).valueOf();

        //  Play the 'shoot' sound.
        game.sounds.playSound('shoot');
    }
};

function PauseState() {


}

PauseState.prototype.keyDown = function(game, keyCode) {

    if (keyCode == 80) {
        //  Pop the pause state.
        game.popState();
        starfield.go();
        document.getElementById('audio').play();
    }
};

PauseState.prototype.draw = function(game, dt, ctx) {

//  Clear the background.
//  ctx.clearRect(0, 0, game.width, game.height);
    ctx.font = "14px ps2";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Pausado", game.width / 2, game.height / 2);
    return;
};

/*  
 Level Intro State
 
 The Level Intro state shows a 'Level X' message and
 a countdown for the level.
 */
function LevelIntroState(level) {
    this.level = level;
    if (this.level == 2) {
        this.countdownMessage = "50";
    } else {
        this.countdownMessage = "3";
    }
}

LevelIntroState.prototype.update = function(game, dt) {

    //  Update the countdown.
    if (this.countdown === undefined) {
        this.countdown = 3; // countdown from 3 secs
    }
    this.countdown -= dt;

    if (this.countdown < 2) {
        this.countdownMessage = "2";
    }
    if (this.countdown < 1) {
        this.countdownMessage = "1";
    }
    if (this.countdown <= 0) {
        //  Move to the next level, popping this state.
        game.moveToState(new PlayState(game.config, this.level));
        document.getElementById('audio').play();
    }

};

LevelIntroState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);
    if (this.countdownMessage == "50") {
        ctx.fillText("Fim de jogo!!");
    } else {
        ctx.font = "36px ps2";
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText("Fase " + this.level, game.width / 2, game.height / 2);
        ctx.font = "24px ps2";
        ctx.fillText("Começa em " + this.countdownMessage, game.width / 2, game.height / 2 + 36);
        return;
    }
};


/*
 
 Ship
 
 The ship has a position and that's about it.
 
 */
function Ship(x, y, forca) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 24;
    this.forca = forca;
}
function Medidor(preenchido) {
    this.width = 100;
    this.height = 15;
    this.preenchido = preenchido;
}

/*
 Rocket
 
 Fired by the ship, they've got a position, velocity and state.
 
 */
function Rocket(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}

/*
 Bomb
 
 Dropped by invaders, they've got position, velocity.
 
 */
function Bomb(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}

/*
 Invader 
 
 Invader's have position, tipo, linha/file and that's about it. 
 */

function Invader(x, y, linha, shield, file, tipo, animacao) {
    this.x = x;
    this.y = y;
    this.linha = linha;
    this.file = file;
    this.tipo = tipo;
    this.width = 44;
    this.height = 32;
    this.shield = shield;
    this.animacao = animacao;
}

/*
 Game State
 
 A Game State is simply an update and draw proc.
 When a game is in the state, the update and draw procs are
 called, with a dt value (dt is delta time, i.e. the number)
 of seconds to update or draw).
 
 */
function GameState(updateProc, drawProc, keyDown, touch, keyUp, enter, leave) {
    this.updateProc = updateProc;
    this.drawProc = drawProc;
    this.keyDown = keyDown;
    this.touch = touch;
    this.keyUp = keyUp;
    this.enter = enter;
    this.leave = leave;
}

/*
 
 Sounds
 
 The sounds class is used to asynchronously load sounds and allow
 them to be played.
 
 */
function Sounds() {

    //  The audio context.
    this.audioContext = null;

    //  The actual set of loaded sounds.
    this.sounds = {};
}

Sounds.prototype.init = function() {

    //  Create the audio context, paying attention to webkit browsers.
    context = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new context();
    this.mute = false;
};

Sounds.prototype.loadSound = function(name, url) {

    //  Reference to ourselves for closures.
    var self = this;

    //  Create an entry in the sounds object.
    this.sounds[name] = null;

    //  Create an asynchronous request for the sound.
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'arraybuffer';
    req.onload = function() {
        self.audioContext.decodeAudioData(req.response, function(buffer) {
            self.sounds[name] = {buffer: buffer};
        });
    };
    try {
        req.send();
    } catch (e) {
        console.log("An exception occured getting sound the sound " + name + " this might be " +
                "because the page is running from the file system, not a webserver.");
        console.log(e);
    }
};

Sounds.prototype.playSound = function(name) {

    //  If we've not got the sound, don't bother playing it.
    if (this.sounds[name] === undefined || this.sounds[name] === null || this.mute === true) {
        return;
    }

    //  Create a sound source, set the buffer, connect to the speakers and
    //  play the sound.
    var source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name].buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
};
