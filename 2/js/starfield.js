/*
 Starfield lets you take a div and turn it into a starfield.
 
 */

//	Define the starfield class.
function Starfield() {
    this.fps = 50;
    this.canvas = null;
    this.width = 0;
    this.width = 0;
    this.minVelocity = -20;
    this.maxVelocity = -30;
    this.stars = 100;
    this.intervalId = 0;
}

//	The main function - initialises the starfield.
Starfield.prototype.initialise = function(div) {
    var self = this;

    //	Store the div.
    this.containerDiv = div;
    self.width = window.innerWidth;
    self.height = window.innerHeight;

//    window.onresize = function(event) {
//        self.width = window.innerWidth;
//        self.height = window.innerHeight;
//        self.canvas.width = self.width;
//        self.canvas.height = self.height;
//        self.draw();
//    }

    //	Create the canvas.
    var canvas = document.createElement('canvas');
    div.appendChild(canvas);
    this.canvas = canvas;
    this.canvas.id = 'fundo';
    this.canvas.width = this.width;
    this.canvas.height = this.height;
};

Starfield.prototype.start = function() {

    //	Create the stars.
    var stars = [];
    for (var i = 0; i < this.stars; i++) {
        stars[i] = new Star(
                Math.random() * this.width, //posicao horizontal
                Math.random() * this.height, //posicao vertical
                Math.floor((Math.random() * 5) + 1), //tamanho
                (Math.random() * (this.maxVelocity - this.minVelocity)) + this.minVelocity//velocidade vertical
                );
    }
    this.stars = stars;

    var self = this;
    //	Start the timer.
    this.intervalId = setInterval(function() {
        self.update();
        self.draw();
        
    }, 1000 / this.fps);
};

Starfield.prototype.stop = function() {
    clearInterval(this.intervalId);
};
Starfield.prototype.go = function() {
     var self = this;
    this.intervalId = setInterval(function() {
        self.update();
        self.draw();
        
    }, 1000 / this.fps);
};


Starfield.prototype.update = function() {
    var dt = 1 / this.fps;

    for (var i = 0; i < this.stars.length; i++) {
        var star = this.stars[i];
        star.y += dt * star.velocity;
        
//        var chmce2 = Math.floor((Math.random() * 10) + 1);
//        if (chmce2 % 2 == 0) {
//            star.x += 8;
//        } else {
//            star.x -= 8;
//        }

        //	If the star has moved from the bottom of the screen, spawn it at the top.

        if (this.minVelocity > 0 && this.maxVelocity > 0) {
            //se as estrelas estao caindo
            if (star.y > this.height) {
                this.stars[i] = new Star(
                        Math.random() * this.width,
                        0,
                        Math.floor((Math.random() * 5) + 1),
                        (Math.random() * (this.maxVelocity - this.minVelocity)) + this.minVelocity);
            }

        } else {
            //se as estrelas estao subindo

            if (star.y < 2) {
                this.stars[i] = new Star(
                        Math.random() * this.width,
                        this.height,
                        Math.floor((Math.random() * 5) + 1),
                        this.minVelocity);
            }
        }

    }
};


Starfield.prototype.toString = function() {
    return "velmin: " + this.minVelocity + ", velmax: " + this.maxVelocity;
};
//Starfield.prototype = {
//    get minVelocity() {
//        return this.minVelocity;
//    },
//    set minVelocity(minVelocity) {
//        this.minVelocity = minVelocity;
//    }
//};


//Starfield.defineProperty(document.body, "minVelocity", {
//	get : function () {
//		return this.minVelocity;
//	},
//	set : function (val) {
//		this.minVelocity = val;
//	}
//});
//document.body.description = 400;




Starfield.prototype.draw = function() {

    //	Get the drawing context.
    var ctx = this.canvas.getContext("2d");

    //	Draw the background.
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    //	Draw stars.
    ctx.fillStyle = '#ffffff';
    for (var i = 0; i < this.stars.length; i++) {
        var star = this.stars[i];
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }
};

function Star(x, y, size, velocity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.velocity = velocity;
}