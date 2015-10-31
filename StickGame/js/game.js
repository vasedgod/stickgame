// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth-18;
canvas.height = window.innerHeight-20;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/fionna.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/Big_Stick.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};
var mouseDown = false;
var mouseLocX = 0
var mouseLocY = 0
var momentum = 0;
var iconSize = 50
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

addEventListener("mousedown", function (e) {
   mouseDown = true;
}, false);

addEventListener("mouseup", function (e) {
   mouseDown = false;
}, false);

addEventListener("mousemove", function (e) {
   e = e || event;
   mouseLocX = e.pageX;
   mouseLocY = e.pageY;
}, false);

// Reset the game when the player catches a monster
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - iconSize));
	monster.y = 32 + (Math.random() * (canvas.height - iconSize));
};

// Update game objects
var update = function (modifier) {
	
    if (!mouseDown){
        if (38 in keysDown && hero.y > 0) { // Player holding up
		    hero.y -= hero.speed * modifier;
	    }
	    if (40 in keysDown && hero.y < canvas.height - 32) { // Player holding down
		    hero.y += hero.speed * modifier;
	    }
	    if (37 in keysDown && hero.x > 0) { // Player holding left
    		hero.x -= hero.speed * modifier;
    	}
    	if (39 in keysDown && hero.x < canvas.width - 32) { // Player holding right
	    	hero.x += hero.speed * modifier;
	    }
    }
    else if(mouseLocX <= (hero.x + iconSize)
            && hero.x <= (mouseLocX)
            && mouseLocY <= (hero.y + iconSize)
            && hero.y <= (mouseLocX)){
        hero.x = mouseLocX-30;
        hero.y = mouseLocY-30;
        
    }

	// Are they touching?
	if (
		hero.x <= (monster.x + iconSize)
		&& monster.x <= (hero.x + iconSize)
		&& hero.y <= (monster.y + iconSize)
		&& monster.y <= (hero.y + iconSize)
	) {
		++monstersCaught;
		reset();
	}
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y, iconSize, iconSize);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y, iconSize, iconSize);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Sticks fetched: " + monstersCaught, 32, 32);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();