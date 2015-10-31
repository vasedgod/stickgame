// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var iconSize = 50;
canvas.width = window.innerWidth-iconSize;
canvas.height = window.innerHeight-iconSize;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// stick image
var stickReady = false;
var stickImage = new Image();
stickImage.onload = function () {
	stickReady = true;
};
stickImage.src = "images/Big_Stick.png";

// fionna image
var fionnaReady = false;
var fionnaImage = new Image();
fionnaImage.onload = function () {
	fionnaReady = true;
};
fionnaImage.src = "images/fionna.png";

// Game objects
var stick = {
	speed: 256 // movement in pixels per second
};
var fionna = {
    speed: 256
};
var sticksFetched = 0;

// Handle keyboard controls
var keysDown = {};
var mouseDown = false;
var mouseLocX = 0
var mouseLocY = 0
var momentum = 0;


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

// Reset the game when the player catches a fionna
var reset = function () {
	stick.x = canvas.width / 2;
	stick.y = canvas.height / 2;

	// Throw the fionna somewhere on the screen randomly
	fionna.x = 32 + (Math.random() * (canvas.width - iconSize));
	fionna.y = 32 + (Math.random() * (canvas.height - iconSize));
};

// Update game objects
var update = function (modifier) {
	
    if (!mouseDown){
        if (38 in keysDown && stick.y > 0) { // Player holding up
		    stick.y -= stick.speed * modifier;
	    }
	    if (40 in keysDown && stick.y < canvas.height - iconSize) { // Player holding down
		    stick.y += stick.speed * modifier;
	    }
	    if (37 in keysDown && stick.x > 0) { // Player holding left
    		stick.x -= stick.speed * modifier;
    	}
    	if (39 in keysDown && stick.x < canvas.width - iconSize) { // Player holding right
	    	stick.x += stick.speed * modifier;
	    }
    }
    else if(mouseLocX <= (stick.x + 1.5*iconSize)
            && stick.x <= (mouseLocX)
            && mouseLocY <= (stick.y + 1.5*iconSize)
            && stick.y <= (mouseLocY)){
        stick.x = mouseLocX-iconSize/2;
        stick.y = mouseLocY-iconSize/2;
        
    }

	// Are they touching?
	if (
		stick.x <= (fionna.x + iconSize)
		&& fionna.x <= (stick.x + iconSize)
		&& stick.y <= (fionna.y + iconSize)
		&& fionna.y <= (stick.y + iconSize)
	) {
		++sticksFetched;
		reset();
	}
};

// Draw everything
var render = function () {
    if (bgReady) {
    	ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }

	if (stickReady) {
		ctx.drawImage(stickImage, stick.x, stick.y, iconSize, iconSize);
	}

	if (fionnaReady) {
		ctx.drawImage(fionnaImage, fionna.x, fionna.y, iconSize, iconSize);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Sticks fetched: " + sticksFetched, 32, 32);
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