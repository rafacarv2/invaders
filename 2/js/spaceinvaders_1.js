/*
 spacearrayInvaders.js
 */

//  Creates an instance of the Game class.
function Game() {
    this.config = {
        bombRate: 0,
        bombVelMinima: 100,
        bombVelMaxima: 150,
        invaderVeloInicial: 50,
//        invaderVeloInicial: 0,
        invaderAceleraX: 20,
        invaderCaiY: 20,
        velocidadeLaser: 300,
        fatorLaser: 1,
        gameWidth: 1280,
        gameHeight: 720,
        fps: 60,
        debugMode: false,
        linhaInvader: 7,
        colunaInvader: 15,
        NaveVelocidadeX: 350,
        fatorDificuldade: 0.2,
        PontosPorInvasor: 5
    };
    //  All state is in the variables below.
    this.lives = 3;
    this.width = 0;
    this.height = 0;
    this.gameBounds = {left: 0, top: 0, right: 0, bottom: 0};
    this.score = 0;
    this.level = 1;

    this.stateStack = [];

    this.pressedKeys = {};
    this.gameCanvas = null;

    //  All sounds.
    this.sounds = null;
}

Game.prototype.initialise = function(gameCanvas) {

    //  Set the game canvas.
    this.gameCanvas = gameCanvas;

    //  Set the game width and height.
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    //  Set the state game bounds.
    this.gameBounds = {
        left: gameCanvas.width / 1.9 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2.1 + this.config.gameWidth / 2,
        top: gameCanvas.height / 1.9 - this.config.gameHeight / 2,
        bottom: gameCanvas.height / 2.1 + this.config.gameHeight / 2
    };

};

Game.prototype.moveToState = function(state) {

    if (this.currentState() && this.currentState().leave) {
        this.currentState().leave(game);
        this.stateStack.pop();
    }
    if (state.enter) {
        state.enter(game);
    }
    this.stateStack.pop();
    this.stateStack.push(state);
};

//  Start the Game.
Game.prototype.start = function() {

    //  Move into the 'welcome' state.
    this.moveToState(new WelcomeState());

    //  Set the game variables.
    this.lives = 3;
//    this.config.debugMode = /debug=true/.test(window.location.href);

    //  Start the game loop.
    var game = this;
    this.intervalId = setInterval(function() {
        GameLoop(game);
    }, 1000 / this.config.fps);


};

//  Retorna o State atual
Game.prototype.currentState = function() {
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};


Game.prototype.mute = function(mute) {


    if (mute === true) {
        this.sounds.mute = true;
    } else if (mute === false) {
        this.sounds.mute = false;
    } else {
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

        //Atualiza e desenha o canvas
        if (currentState.update) {
            currentState.update(game, dt);
        }
        if (currentState.draw) {
            currentState.draw(game, dt, ctx);
        }
    }
}

Game.prototype.pushState = function(state) {

    //  Chama a funcao enter, caso haja uma pro State
    if (state.enter) {
        state.enter(game);
    }
    //  Seta o State
    this.stateStack.push(state);
};

Game.prototype.popState = function() {

    //  Dá pop no State
    if (this.currentState()) {
        if (this.currentState().leave) {
            this.currentState().leave(game);
        }

        //  Seta o State
        this.stateStack.pop();
    }
};

//  The stop function stops the game.
Game.prototype.stop = function Stop() {
    clearInterval(this.intervalId);
};

//  Descobre se apertei a tecla
Game.prototype.keyDown = function(keyCode) {
    this.pressedKeys[keyCode] = true;
    //  Delegate to the current state too.
    if (this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, keyCode);
    }
};

//  Descobre se soltei a tecla
Game.prototype.keyUp = function(keyCode) {
    delete this.pressedKeys[keyCode];
    //  Define o estado
    if (this.currentState() && this.currentState().keyUp) {
        this.currentState().keyUp(this, keyCode);
    }
};

function WelcomeState() {

}

WelcomeState.prototype.enter = function(game) {

    game.sounds = new Sounds();
    game.sounds.init();
    game.sounds.loadSound('shoot', '../sounds/shoot.wav');
    game.sounds.loadSound('bang', '../sounds/bang.wav');
    game.sounds.loadSound('explosion', '../sounds/explosion.wav');
    game.sounds.loadSound('pause', '../sounds/pause.wav');
    game.sounds.loadSound('gelo', '../sounds/gelo.mp3');
};

WelcomeState.prototype.update = function(game, dt) {


};

WelcomeState.prototype.draw = function(game, dt, ctx) {

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
        //  Barra de espaço p/ reiniciar
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

    }
};

//  Create a PlayState with the game config and the level you are on.
function PlayState(config, level) {
    this.config = config;
    this.level = level;

    //  Game state.
    this.invaderVelocidadeAtual = 10;
    this.invaderCaiYAtual = 0;
    this.invadersCaindo = false;
    this.lastRocketTime = null;

    //  Game entities.
    this.nave = null;
    this.arrayInvaders = [];
    this.arrayLaser = [];
    this.arrayBombas = [];
    this.arrayPowerUP = [];
    this.medidor = null;
}

PlayState.prototype.enter = function(game) {

    //  Create the nave.
    this.nave = new Ship(game.width / 2, game.gameBounds.bottom - 20, 100);

    // Cria o medidor de forca
    this.medidor = new Medidor(100);

    //  Setup initial state.
    this.invaderVelocidadeAtual = 10;
    this.invaderCaiYAtual = 0;
    this.invadersCaindo = false;

    var levelMultiplier = this.level * this.config.fatorDificuldade;
    this.NaveVelocidadeX = this.config.NaveVelocidadeX;
    this.invaderVeloInicial = this.config.invaderVeloInicial + (levelMultiplier * this.config.invaderVeloInicial);
    this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
    this.bombVelMinima = this.config.bombVelMinima + (levelMultiplier * this.config.bombVelMinima);
    this.bombVelMaxima = this.config.bombVelMaxima + (levelMultiplier * this.config.bombVelMaxima);

    //  Cria os invasores num array
    var linhas = this.config.linhaInvader;
    var files = this.config.colunaInvader;
    var arrayInvaders = [];
    for (var linha = 0; linha < linhas; linha++) {
        var tipo = (Math.round((Math.random() * 2) + 1));
        for (var file = 0; file < files; file++) {
            arrayInvaders.push(new Invader(
                    (game.width / 2) + ((files / 2 - file) * 700 / files),
                    (game.gameBounds.top + 20 + linha * 40),
                    linha, 3, file, tipo));
        }
    }
    this.arrayInvaders = arrayInvaders;
    this.invaderVelocidadeAtual = this.invaderVeloInicial;
    this.invaderVelocity = {x: -this.invaderVeloInicial, y: 0};
    this.invaderNextVelocity = null;
};

PlayState.prototype.update = function(game, dt) {
    if (frame_hit == 0) {
        frame_power++;
        if (game.lives <= 0) {
            game.moveToState(new GameOverState());
        }
        if (game.pressedKeys[37]) {
            this.nave.x -= this.NaveVelocidadeX * dt;
            this.nave.animacao = 0;
        } else if (game.pressedKeys[39]) {
            this.nave.x += this.NaveVelocidadeX * dt;
            this.nave.animacao = 2;
        } else {
            this.nave.animacao = 1;
        }
        if (game.pressedKeys[32]) {
            this.fireRocket();
        } else {
            if (this.nave.forca < 100)
                this.nave.forca += 1;

        }

        //  Keep the nave in bounds.
        if (this.nave.x < game.gameBounds.left + 20) {
            this.nave.x = game.gameBounds.left + 20;
        }
        if (this.nave.x > game.gameBounds.right - 20) {
            this.nave.x = game.gameBounds.right - 20;
        }

        //  Move each bomb.
        for (var i = 0; i < this.arrayBombas.length; i++) {
            var bomb = this.arrayBombas[i];
            bomb.y += dt * bomb.velocity;

            //  If the rocket has gone off the screen remove it.
            if (bomb.y > this.height) {
                this.arrayBombas.splice(i--, 1);
            }
        }

        if (frame_power == 250 && this.arrayPowerUP.length < 1) {
            var tipoPower = (Math.round((Math.random() * 4) + 1));
            //0 ate 1200 Math.floor((Math.random() * 1200) + 1)
            this.arrayPowerUP.push(new PowerUp(Math.floor((Math.random() * 1195) + 50), game.gameBounds.bottom - 20, tipoPower));

        } else if (frame_power > 450) {
            this.arrayPowerUP = [];
            frame_power = 0;
        }


        //  Move each rocket.
        for (i = 0; i < this.arrayLaser.length; i++) {
            var rocket = this.arrayLaser[i];
            rocket.y -= dt * rocket.velocity;

            //  If the rocket has gone off the screen remove it.
            if (rocket.y < 0) {
                this.arrayLaser.splice(i--, 1);
            }
        }

        //  Move the arrayInvaders.
        var hitLeft = false, hitRight = false, hitBottom = false;
        for (i = 0; i < this.arrayInvaders.length; i++) {
            var invader = this.arrayInvaders[i];
            var newx = invader.x + this.invaderVelocity.x * dt;
            var newy = invader.y + this.invaderVelocity.y * dt;
            if (hitLeft == false && newx < game.gameBounds.left + 30) {
                hitLeft = true;
            }
            else if (hitRight == false && newx > game.gameBounds.right - 30) {
                hitRight = true;
            }
            else if (hitBottom == false && newy >= game.gameBounds.bottom) {
                hitBottom = true;
            }

            if (!hitLeft && !hitRight && !hitBottom) {
                invader.x = newx;
                invader.y = newy;
            }
        }

        //  Update invader velocities.
        if (this.invadersCaindo) {
            this.invaderCaiYAtual += this.invaderVelocity.y * dt;
            if (this.invaderCaiYAtual >= this.config.invaderCaiY) {
                this.invadersCaindo = false;
                this.invaderVelocity = this.invaderNextVelocity;
                this.invaderCaiYAtual = 0;
            }
        }
        //  If we've hit the left, move down then right.
        if (hitLeft) {
            this.invaderVelocidadeAtual += this.config.invaderAceleraX;
            this.invaderVelocity = {x: 0, y: this.invaderVelocidadeAtual};
            this.invadersCaindo = true;
            this.invaderNextVelocity = {x: this.invaderVelocidadeAtual, y: 0};
        }
        //  If we've hit the right, move down then left.
        if (hitRight) {
            this.invaderVelocidadeAtual += this.config.invaderAceleraX;
            this.invaderVelocity = {x: 0, y: this.invaderVelocidadeAtual};
            this.invadersCaindo = true;
            this.invaderNextVelocity = {x: -this.invaderVelocidadeAtual, y: 0};
        }
        //  If we've hit the bottom, it's game over.
        if (hitBottom) {
            game.lives = 0;
        }

        //  Check for rocket/invader collisions.
        for (i = 0; i < this.arrayInvaders.length; i++) {
            var invader = this.arrayInvaders[i];
            var bang = false;

            for (var j = 0; j < this.arrayLaser.length; j++) {
                var rocket = this.arrayLaser[j];

                if (rocket.x >= (invader.x - invader.width / 2) && rocket.x <= (invader.x + invader.width / 2) &&
                        rocket.y >= (invader.y - invader.height / 2) && rocket.y <= (invader.y + invader.height / 2)) {

                    //  Remove the rocket, set 'bang' so we don't process
                    //  this rocket again.
                    this.arrayLaser.splice(j--, 1);
                    bang = true;
                    game.score += this.config.PontosPorInvasor;
                    break;
                }
            }
            if (bang) {
                if (invader.shield <= 1) {
                    this.arrayInvaders.splice(i--, 1);
                } else {
                    invader.shield -= 1;
                }
                if (this.bombRate < 0.8) {
                    this.bombRate = this.bombRate + 0.04;
                }
                game.sounds.playSound('bang');
            }
        }

        //  Define a vanguarda
        var InvaderVanguarda = {};
        for (var i = 0; i < this.arrayInvaders.length; i++) {
            var invader = this.arrayInvaders[i];
            //  If we have no invader for game file, or the invader
            //  for game file is futher behind, set the front
            //  linha invader to game one.
            if (!InvaderVanguarda[invader.file] || InvaderVanguarda[invader.file].linha < invader.linha) {
                InvaderVanguarda[invader.file] = invader;
            }
        }

        //  Controla as bombas da vanguarda
        for (var i = 0; i < this.config.colunaInvader; i++) {
            var invader = InvaderVanguarda[i];
            if (!invader)
                continue;
            var chance = this.bombRate * dt;
            if (chance > Math.random()) {
                //  Dispara bomba
                this.arrayBombas.push(new Bomb(invader.x, invader.y + invader.height / 2,
                        this.bombVelMinima + Math.random() * (this.bombVelMaxima - this.bombVelMinima)));
            }
        }

        //  Check for bomb/nave collisions.
        for (var i = 0; i < this.arrayBombas.length; i++) {
            var bomb = this.arrayBombas[i];
            if (bomb.x >= (this.nave.x - this.nave.width / 2) && bomb.x <= (this.nave.x + this.nave.width / 2) &&
                    bomb.y >= (this.nave.y - this.nave.height / 2) && bomb.y <= (this.nave.y + this.nave.height / 2)) {
                this.arrayBombas.splice(i--, 1);
                game.lives--;

                game.sounds.playSound('explosion');
                frame_hit = 1;
                if (game.lives == 0) {
                    document.getElementById('audio').pause();
                    document.getElementById('audio').currentTime = 0;
                }
            }
        }

        //  Check for invader/nave collisions.
        for (var i = 0; i < this.arrayInvaders.length; i++) {
            var invader = this.arrayInvaders[i];
            if ((invader.x + invader.width / 2) > (this.nave.x - this.nave.width / 2) &&
                    (invader.x - invader.width / 2) < (this.nave.x + this.nave.width / 2) &&
                    (invader.y + invader.height / 2) > (this.nave.y - this.nave.height / 2) &&
                    (invader.y - invader.height / 2) < (this.nave.y + this.nave.height / 2)) {
                //  Dead by collision!
                game.lives = 0;
                game.sounds.playSound('explosion');
            }
        }
        //  Pega powrup
        for (var i = 0; i < this.arrayPowerUP.length; i++) {
            var power = this.arrayPowerUP[i];
            if ((power.x + power.width / 2) > (this.nave.x - this.nave.width / 2) &&
                    (power.x - power.width / 2) < (this.nave.x + this.nave.width / 2) &&
                    (power.y + power.height / 2) > (this.nave.y - this.nave.height / 2) &&
                    (power.y - power.height / 2) < (this.nave.y + this.nave.height / 2)) {
                console.log(power.tipo);
                switch (power.tipo)
                {
                    case 1:
                        game.sounds.playSound('gelo');
                        this.NaveVelocidadeX += 50;
                    case 2:
                        game.sounds.playSound('gelo');
                        game.score += 100;
                        break;
                    case 3:
                        game.sounds.playSound('gelo');
                        this.nave.forca = 100;
                        break;
                    case 4:
                        game.sounds.playSound('gelo');
                        this.config.fatorLaser += 1;
                        break;
                    case 5:
                        game.sounds.playSound('gelo');
                        game.lives += 1;
                        break;
                }

                this.arrayPowerUP.splice(i--, 1);
                frame_power = 0;
            }
        }
        //  Vitoria por eliminacao de arrayInvaders
        if (this.arrayInvaders.length === 0) {
            game.score += this.level * 50;
            game.level += 1;
//            if (game.level > 1) {
//            game.moveToState(new VictoryState(game.level));
//            } else {
            game.moveToState(new LevelIntroState(game.level));
//            }
        }
    } else {
        frame_hit++;
        this.arrayBombas = [];
        this.arrayLaser = [];
        this.nave.forca = 100;
        if (frame_hit > 90) {
            frame_hit = 0;
            if (game.lives <= 0) {
                document.getElementById('gameover').play();
                game.moveToState(new GameOverState());
            }
        }
    }
};

PlayState.prototype.draw = function(game, dt, ctx) {
    frame_invader++;
    ctx.clearRect(0, 0, game.width, game.height);

    //  Desenha jogador.
    //versao retangulo comentada
    /*ctx.fillStyle = '#0011ff';
     ctx.fillRect(
     this.nave.x - (this.nave.width / 2),
     this.nave.y - (this.nave.height / 2),
     this.nave.width, this.nave.height);*/
    var naveSX;
    switch (this.nave.animacao) {
        case 0:
            naveSX = 0;
            break;
        case 1:
            naveSX = 32;
            break;
        case 2:
            naveSX = 64;
            break;
    }
    var ShipSY;
    if (frame_hit > 0) {

        switch (true) {
            case (frame_hit < 2):
                naveSX = 0;
                ShipSY = 108;
                break;
            case (frame_hit < 4):
                naveSX = 36;
                ShipSY = 108;
                break;
            case (frame_hit < 6):
                naveSX = 72;
                ShipSY = 108;
                break;
            case (frame_hit < 8):
                naveSX = 108;
                ShipSY = 108;
                break;
            case (frame_hit < 10):
                naveSX = 144;
                ShipSY = 108;
                break;
            case (frame_hit < 12):
                naveSX = 180;
                ShipSY = 108;
                break;
            case (frame_hit < 14):
                naveSX = 216;
                ShipSY = 108;
                break;
            case (frame_hit < 16):
                naveSX = 0;
                ShipSY = 144;
                break;
            case (frame_hit < 18):
                naveSX = 36;
                ShipSY = 144;
                break;
            case (frame_hit < 20):
                naveSX = 72;
                ShipSY = 144;
                break;
            case (frame_hit < 22):
                naveSX = 108;
                ShipSY = 144;
                break;
            case (frame_hit < 24):
                naveSX = 144;
                ShipSY = 144;
                break;
            case (frame_hit < 26):
                naveSX = 180;
                ShipSY = 144;
                break;
            case (frame_hit < 35):
                naveSX = 216;
                ShipSY = 144;
                break;
        }
        ctx.drawImage(
                invaderIMG, //img
                naveSX, ShipSY, //sx,sy
                36, 36, //swidth,sheight
                this.nave.x - (this.nave.width / 2), this.nave.y - 10 - (this.nave.height / 2), //x,y
                36, 36//width,height
                );
    } else {
        ShipSY = 181;
        ctx.drawImage(
                invaderIMG, //img
                naveSX, ShipSY, //sx,sy
                this.nave.width, this.nave.height, //swidth,sheight
                this.nave.x - (this.nave.width / 2), this.nave.y - (this.nave.height / 2), //x,y
                this.nave.width, this.nave.height//width,height
                );
    }
    for (var i = 0; i < this.arrayPowerUP.length; i++) {
//desenha os powerups
        var p_sx;
        switch (this.arrayPowerUP[i].tipo) {
            case 1:
                p_sx = 99;
                break;
            case 2:
                p_sx = 125;
                break;
            case 3:
                p_sx = 150;
                break;
            case 4:
                p_sx = 175;
                break;
            case 5:
                p_sx = 200;
                break;

        }
        ctx.drawImage(
                invaderIMG, //img
                p_sx, 182, //sx,sy
                this.arrayPowerUP[i].width, this.arrayPowerUP[i].height, //swidth,sheight
                this.arrayPowerUP[i].x - this.arrayPowerUP[i].width / 2, this.arrayPowerUP[i].y - this.arrayPowerUP[i].height / 2, //x,y
                this.arrayPowerUP[i].width, this.arrayPowerUP[i].height//width,height
                );

    }

    //Desenha medidor de forca
    ctx.fillStyle = '#ff0000';//fundo vermelho
    ctx.fillRect(90, game.gameBounds.bottom, 500, 25);
//    ctx.fillStyle = '#00bbff';//arma fria
    ctx.fillStyle = '#00ff00';//fundo medidor
    ctx.fillRect(590, game.gameBounds.bottom, this.nave.forca * -5, 25);
//    
//    var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14;
    ctx.font = "8px ps2";
//    var info = "Vidas: " + game.lives + ", Força do laser: 10";
    if (this.nave.forca < 30) {
        ctx.fillStyle = '#FFF';
        var info = "SUPERAQUECIMENTO!!! CESSAR FOGO!!!";
    } else {
        ctx.fillStyle = '#000';
        var info = "Temperatura da arma";
    }
    ctx.textAlign = "left";
    ctx.fillText(info, 90, game.gameBounds.bottom + 5);



    //  Draw arrayInvaders.
    for (var i = 0; i < this.arrayInvaders.length; i++) {

        var invader = this.arrayInvaders[i];
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

        if (frame_invader < 25) {
            sx = invaderFrameA;
        } else {
            sx = invaderFrameB;
            if (frame_invader > 49) {
                frame_invader = 0;
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

    //  Draw arrayBombas.
    ctx.fillStyle = '#ff5555';
    for (var i = 0; i < this.arrayBombas.length; i++) {
        var bomb = this.arrayBombas[i];
        ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
    }

    //  Draw arrayLaser.
    ctx.fillStyle = '#ff0000';
    for (var i = 0; i < this.arrayLaser.length; i++) {
        var rocket = this.arrayLaser[i];
        ctx.fillRect(rocket.x, rocket.y - 2, 4, 4);
    }

    //  Draw info.
//    var textYpos = game.height - 50;
    ctx.font = "16px ps2";
    ctx.fillStyle = '#ffffff';
//    var info = "Vidas: " + game.lives + ", Força do laser: 10";
// ShipSY = 181;
    ctx.drawImage(
            invaderIMG, //img
            32, 181, //sx,sy
            this.nave.width, this.nave.height, //swidth,sheight
            0, game.height - 30, //x,y
            this.nave.width, this.nave.height//width,height
            );
    var info = "  X" + game.lives;
    ctx.textAlign = "left";
    ctx.fillText(info, 0, game.height - 10);
//    info = "Score: " + game.score + ", Fase: " + game.level;
    info = "Score: " + game.score;
    ctx.textAlign = "right";
    ctx.fillText(info, game.gameBounds.right, 20);

    //  Modo DEBUG, mostra fronteireas
    if (this.config.debugMode) {
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(0, 0, game.width, game.height);
        ctx.strokeStyle = '#00ff00';
        ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
                game.gameBounds.right - game.gameBounds.left,
                game.gameBounds.bottom - game.gameBounds.top);
        ctx.fillText("MODO DEBUG LIGADO!!!", game.width / 1.5, 10);
    }

};

PlayState.prototype.keyDown = function(game, keyCode) {

//    if (keyCode == 32) {
//        //  Fire!
//        this.fireRocket();
//    }
    if (keyCode == 80) {
        //  Push the pause state.
        document.getElementById('audio').pause();
        starfield.stop();
//        this.arrayBombas = [];
        game.sounds.playSound('pause');
        game.pushState(new PauseState());
    }
};

PlayState.prototype.keyUp = function(game, keyCode) {
};

PlayState.prototype.fireRocket = function() {
    if (this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / (this.nave.forca / 15 + this.config.fatorLaser)))
    {
        if (this.nave.forca > 0) {
            this.nave.forca -= 1;
        }
        this.arrayLaser.push(new Rocket(this.nave.x, this.nave.y - 12, this.config.velocidadeLaser));
        this.lastRocketTime = (new Date()).valueOf();

        game.sounds.playSound('shoot');
    }
};

function PauseState() {


}

PauseState.prototype.keyDown = function(game, keyCode) {

    if (keyCode == 80) {
        game.popState();
        starfield.go();
        document.getElementById('audio').play();
    }
};

PauseState.prototype.draw = function(game, dt, ctx) {

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
    document.getElementById('gameover').pause();
    document.getElementById('gameover').currentTime = 0;
    this.level = level;
//    if (this.level == 2) {
//        this.countdownMessage = "50";
//    } else {
    this.countdownMessage = "3";
//    }
}

LevelIntroState.prototype.update = function(game, dt) {

    if (this.countdown === undefined) {
        this.countdown = 3; // Pra evitar problemas
    }
    this.countdown -= dt;

    if (this.countdown < 2) {
        this.countdownMessage = "2";
    }
    if (this.countdown < 1) {
        this.countdownMessage = "1";
    }
    if (this.countdown <= 0) {
        //  Dá pop e vai pra outra fase
        game.moveToState(new PlayState(game.config, this.level));
        document.getElementById('audio').play();
    }

};

LevelIntroState.prototype.draw = function(game, dt, ctx) {

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
function Rocket(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}

function Bomb(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}

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
function PowerUp(x, y, tipo) {
    this.x = x;
    this.y = y;
    this.tipo = tipo;
    this.width = 23;
    this.height = 20;
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
