// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var iconSize = 50;
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
// Game objects
var stick = {
    dx: 0, //amount to move left-right next time step
    dy: 0 //amount to move up-down next tiem step
};
var fionna = {
    speed: 256,
    dx: 0,
    dy: 0
};
var sticksFetched = 0;
var keysDown = {};
var mouseDown = false;
var mouseLocX = 0;
var mouseLocY = 0;
var mouseVelocity = {x:0, y:0};
var friction = 0.96;
var stickGrabbed = false;
var topPadding = 1;
var bottomPadding = 2; 
var leftPadding = 2;
var rightPadding = 2.5;

//Collect the EventListeners here
addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);
addEventListener("mousedown", function(e) {
    mouseDown = true;
    //If the mouse clicks down on the stick, we will consider the stick grabbed,
    // and it will follow the cursor until mouseDown=false
    if (mouseLocX <= (stick.x + 1.5 * iconSize)
        && stick.x <= (mouseLocX) 
        && mouseLocY <= (stick.y + 1.5 * iconSize) 
        && stick.y <= (mouseLocY)){
        stickGrabbed = true;
    }
}, false);
addEventListener("mouseup", function(e) {
    //Set so that stick must actually be grabbed in order to throw it.
    //Might set this back to if (mouseDown) later, could be touchDown or whatever also.
    if (stickGrabbed) {
        stick.dx = mouseVelocity.x;
        stick.dy = mouseVelocity.y;
    }
    mouseDown = false;
    //Release the stick if the mouse button is released, or mouseDown = false
    stickGrabbed = false;
}, false);
addEventListener("mousemove", function(e) {
    e = e || event;
    mouseVelocity.x = e.pageX - mouseLocX;
    mouseVelocity.y = e.pageY - mouseLocY;
    mouseLocX = e.pageX;
    mouseLocY = e.pageY;
}, false);
// Reset the game when the player catches a fionna
var reset = function() {
    //Release the mouse button variable when the game resets, want the mouse to be picked up every time.
    mouseDown = false;
    stick.x = canvas.width / 2;
    stick.y = canvas.height / 2;
    // Throw the fionna somewhere on the screen randomly
    fionna.x = leftPadding * iconSize + (Math.random() * (canvas.width - 2 * rightPadding * iconSize));
    fionna.y = topPadding * iconSize + (Math.random() * (canvas.height - bottomPadding * iconSize));
    stick.dx = 0;
    stick.dy = 0;
};
// Update game objects
var update = function(modifier) {
    //These variables adjust the padding for how far from the canvas border the stick can bounce
    //In units of 'iconSize', the size of the stick and Fionna icons.
    
    var bounceDecayFactor = 0.95;
    
    if(mouseDown && stickGrabbed
        && mouseLocX > leftPadding * iconSize
        && mouseLocX < (canvas.width - rightPadding * iconSize)
        && mouseLocY > topPadding * iconSize
        && mouseLocY < (canvas.height - bottomPadding * iconSize)) {
        //Center the stick under the cursor at all times while stickGrabbed is true
        //and the mouse button is still held down
        stick.x = mouseLocX - iconSize / 2;
        stick.y = mouseLocY - iconSize / 2;
    }
    else if (stick.x+stick.dx > leftPadding * iconSize
        && stick.x+stick.dx < (canvas.width - rightPadding * iconSize)
        && stick.y+stick.dy > topPadding * iconSize
        && stick.y+stick.dy < (canvas.height - bottomPadding * iconSize)){
        //Checking for if the next time step will send the stick at its current velocity out of bounds
        //If it won't, move it along by dx and dy and adjust the new dx and dy with our friction variable
        stick.x = stick.x + stick.dx;
        stick.y = stick.y + stick.dy;
        stick.dx *= friction - 0.1;
        stick.dy *= friction - 0.1;
        //If speed of stick is small enough, just set it to zero so it doesn't slow down forever
        if (Math.abs(stick.dx) < 0.0001){
            stick.dx = 0;
        }
        if (Math.abs(stick.dy) < 0.0001){
            stick.dy = 0;
        }
    }
    else{
        //If the next time step will take it out of bounds, set the position of the stick to be directly 
        //on the boundary it would hit, and flip the dx/dy appropriately and apply an energy loss
        if (stick.x + stick.dx <= leftPadding * iconSize){
            stick.x = leftPadding * iconSize;
            stick.dx = stick.dx * friction * -1 * bounceDecayFactor; //If the stick hits the left wall, flip its dx and apply energy loss
        }
        if (stick.y + stick.dy <= topPadding * iconSize){
            stick.y = topPadding * iconSize;
            stick.dy = stick.dy * friction * -1 * bounceDecayFactor;
        }
        if (stick.x + stick.dx >= (canvas.width - rightPadding * iconSize)){
            stick.x = canvas.width - rightPadding * iconSize;
            stick.dx = stick.dx * friction * -1 * bounceDecayFactor;
        }
        if (stick.y + stick.dy >= (canvas.height - bottomPadding * iconSize)){
            stick.y = canvas.height - bottomPadding * iconSize;
            stick.dy = stick.dy * friction * -1 * bounceDecayFactor;
        }
        
    }
    // Are they touching?
    if(stick.x <= (fionna.x + iconSize) 
       && fionna.x <= (stick.x + iconSize) 
       && stick.y <= (fionna.y + iconSize) 
       && fionna.y <= (stick.y + iconSize)) {
        ++sticksFetched;
        reset();
    }
};
// Draw everything
var render = function() {
    if(bgReady) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }
    if(stickReady) {
        ctx.drawImage(stickImage, stick.x, stick.y, iconSize, iconSize);
    }
    if(fionnaReady) {
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