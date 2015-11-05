// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

//Draw the canvas with 90% the height and width of the window
canvas.width = window.innerWidth*0.9;
canvas.height = window.innerHeight*0.9;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function() {
    bgReady = true;
};
bgImage.src = "images/background.png";
// stick image
var stickReady = false;
var stickImage = new Image();
stickImage.onload = function() {
    stickReady = true;
};
stickImage.src = "images/Big_Stick.png";
// fionna image
var fionnaReady = false;
var fionnaImage = new Image();
fionnaImage.onload = function() {
    fionnaReady = true;
};
fionnaImage.src = "images/fionna.png";

//Canvas variables, etc.
var sticksFetched = 0;
var keysDown = {};
var gameScale = canvas.width / 512;
var friction = 0.95 + (0.003 * gameScale);
var verticalPadding = canvas.height / 15; 
var horizontalPadding = canvas.width / 16;
var iconSize = 30 * Math.log(2 * gameScale);
console.log("verticalPadding = " + verticalPadding);
console.log("horizontalPadding = " + horizontalPadding);
console.log("friction = " + friction);
console.log("gameScale = " + gameScale);

// Game objects
var stick = {
    dx: 0, //amount to move left-right next time step
    dy: 0, //amount to move up-down next time step
    isGrabbed: false
};
var fionna = {
    speed: 3 + .6 * gameScale,
    toStickX: 0,
    toStickY: 0,
    toStickMagnitude: 0,
    dx: 0,
    dy: 0
};
var mouse = {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    isClicked : false
};


//Collect the EventListeners here
addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
}, false);


addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);


addEventListener("mousedown", function(e) {
    mouse.isClicked = true;
    //If the mouse clicks down on the stick, we will consider the stick grabbed,
    // and it will follow the cursor until mouse.isClicked=false
    if (mouse.x <= (stick.x + 1.5 * iconSize)
            && stick.x <= (mouse.x) 
            && mouse.y <= (stick.y + 1.5 * iconSize) 
            && stick.y <= (mouse.y)) {
        stick.isGrabbed = true;
    }
}, false);


addEventListener("mouseup", function(e) {
    //Set so that stick must actually be grabbed in order to throw it.
    //Might set this back to if (mouse.isClicked) later, could be touchDown or whatever also.
    if (stick.isGrabbed) {
        stick.dx = mouse.velocityX;
        stick.dy = mouse.velocityY;
    }
    mouse.isClicked = false;
    //Release the stick if the mouse button is released, or mouse.isClicked = false
    stick.isGrabbed = false;
}, false);


addEventListener("mousemove", function(e) {
    e = e || event;
    mouse.velocityX = (e.pageX - mouse.x) * gameScale;
    mouse.velocityY = (e.pageY - mouse.y) * gameScale;
    mouse.x = e.pageX;
    mouse.y = e.pageY;
}, false);


// Reset the game when the player catches a fionna
var reset = function() {
    //Release the mouse button variable when the game resets, want the mouse to be picked up every time.
    mouse.isClicked = false;
    stick.isGrabbed = false;
    stick.x = canvas.width / 2;
    stick.y = canvas.height / 2;
    // Throw the fionna somewhere on the screen randomly
    fionna.x = horizontalPadding + (Math.random() * (canvas.width - 2 * horizontalPadding - iconSize));
    fionna.y = verticalPadding + (Math.random() * (canvas.height - 2 * verticalPadding - iconSize));
    fionna.dx = 0;
    fionna.dy = 0;
    stick.dx = 0;
    stick.dy = 0;
};


var isInBoundary = function(point, direction) {
    if (direction == "horizontal") {
        return (point > (horizontalPadding) && point < (canvas.width - horizontalPadding - iconSize));
    }
    else if (direction == "vertical") {
        return (point > (verticalPadding) && point < (canvas.height - verticalPadding - iconSize));
    }
};

// Update game objects
var update = function(modifier) {
    //These variables adjust the padding for how far from the canvas border the stick can bounce
    //In units of 'iconSize', the size of the stick and Fionna icons.
    
    var bounceDecayFactor = 0.95;
    
    //MOUSE DRAGGING HANDLER
    //Allow stick to be dragged freely along either axis as long as that axis is not
    //blocked by a boundary
    if (mouse.isClicked && stick.isGrabbed) {
        if (mouse.x > (horizontalPadding + iconSize / 2)
                && mouse.x < (canvas.width - horizontalPadding - iconSize / 2)) {
            stick.x = mouse.x - iconSize / 2;
        }
        if (mouse.y > (verticalPadding + iconSize / 2)
                && mouse.y < (canvas.height - verticalPadding - iconSize / 2)) {
            stick.y = mouse.y - iconSize / 2;
        }
    }
    //STICK TRAJECTORY HANDLER
    else{
        //Checking for if the next time step will send the stick at its current velocity out of bounds
        //If it won't, move it along by dx and dy and adjust the new dx and dy with our friction variable
        if ( isInBoundary(stick.x + stick.dx, "horizontal") ) {
            stick.x = stick.x + stick.dx;
            stick.dx *= friction - 0.1;
        }
        if ( isInBoundary(stick.y + stick.dy, "vertical") ) {
            stick.y = stick.y + stick.dy;
            stick.dy *= friction - 0.1;
        }
        //If speed of stick is small enough, just set it to zero so it doesn't slow down forever
        if (Math.abs(stick.dx) < 0.0001) {
            stick.dx = 0;
        }
        if (Math.abs(stick.dy) < 0.0001) {
            stick.dy = 0;
        }
    
    //STICK BOUNCE HANDLER
        else{
        //If the next time step will take it out of bounds, set the position of the stick to be directly 
        //on the boundary it would hit, and flip the dx/dy appropriately and apply an energy loss
            if (stick.x + stick.dx <= horizontalPadding) {
                stick.x = horizontalPadding;
                stick.dx = stick.dx * friction * -1 * bounceDecayFactor; //If the stick hits the left wall, flip its dx and apply energy loss
            }
            if (stick.x + stick.dx >= (canvas.width - horizontalPadding - iconSize)) {
                stick.x = canvas.width - horizontalPadding - iconSize;
                stick.dx = stick.dx * friction * -1 * bounceDecayFactor;
            }
            if (stick.y + stick.dy <= verticalPadding) {
                stick.y = verticalPadding;
                stick.dy = stick.dy * friction * -1 * bounceDecayFactor;
            }
            if (stick.y + stick.dy >= (canvas.height - verticalPadding - iconSize)) {
                stick.y = canvas.height - verticalPadding - iconSize;
                stick.dy = stick.dy * friction * -1 * bounceDecayFactor;
            }
        }
    }
    
    //Fionna finds the vector from her to the stick, takes the magnitude, calculates unit vector, scales it to her speed
    fionna.toStickX = stick.x - fionna.x;
    fionna.toStickY = stick.y - fionna.y;
    fionna.toStickMagnitude = Math.sqrt(Math.pow(fionna.toStickX,2) + Math.pow(fionna.toStickY,2));
    fionna.dx = fionna.speed * fionna.toStickX / fionna.toStickMagnitude;
    fionna.dy = fionna.speed * fionna.toStickY / fionna.toStickMagnitude;
    
    //Check if Fionna's about to move out of bounds. This shouldn't ever come up while she's not making up her own paths.
    //While she is in bounds, move her by (dx,dy).
    if ( isInBoundary(fionna.x + fionna.dx, "horizontal") ) {
        fionna.x += fionna.dx;
    }
    if ( isInBoundary(fionna.y + fionna.dy, "vertical") ) {
        fionna.y += fionna.dy;
    };
    
    // Are they touching?
    if (stick.x <= (fionna.x + iconSize) 
            && fionna.x <= (stick.x + iconSize) 
            && stick.y <= (fionna.y + iconSize) 
            && fionna.y <= (stick.y + iconSize)) {
        ++sticksFetched;
        reset();
    };
};


// Draw everything
var render = function() {
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
var main = function() {
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
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame 
    || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
// Let's play this game!
var then = Date.now();
reset();
main();