/**
 * Plot of electromagnetic wave.
 * @param {Number} id Id of the signal plot.
 * @param {*} options Options for the simulation.
 * @returns Public APIs.
 */
let particlePlot = function (id, options = {
    maxSpeed: 600,
    plotContainer: document.getElementById("plot-container")
}) {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /*_______________________________________
    |   Resizing variables
    */

    /**
     * Width of the plot.
     */
    let width;

    /**
     * Height of the plot.
     */
    let height;

    /*_______________________________________
    |   General variables
    */

    /**
     * True if the simulation is running, false otherwise.
     */
    let running = true;

    /**
     * True if left mouse button is down, false otherwise.
     */
    let mouseDown = false;

    /*_______________________________________
    |   HTML elements
    */

    /**
     * Parent div.
     */
    let plotContainer = options.plotContainer;

    let physicalPlots = options.physicalPlots;;

    /*_______________________________________
    |   Simulation variables
    */

    /**
     * Speed of light.
     */
    let maxSpeed = options.speedOfLight;

    /**
     * Mouse position.
     */
    let mouse = { x: 0, y: 0 };

    /**
     * Position of the particle.
     */
    let particle = { x: 0, y: 0 };

    /**
     * Velocity of the charged particle.
     */
    let velocity = { x: 0, y: 0 };

    /**
     * Previous velocities of the charged particle.
     */
    let velocities = [];

    /**
     * Current acceleration of the charged particle.
     */
    let acceleration = { x: 0, y: 0 };

    /**
     * Previous acceleration and position data of the charged particle.
     */
    let particleEvents = [];

    /**
     * Max number of stored accelerations and positions of the charged particle.
     */
    let eventsSize = 400;

    /**
     * Number of frames over which acceleration is averaged.
     */
    let avgTime = 20;

    /*_______________________________________
    |   Plot update
    */

    /**
     * Updates the plot.
     * @param {*} options Options for the simulation.
     */
    publicAPIs.update = function (options = { speedOfLight: maxSpeed }) {
        // Updates the parameters
        maxSpeed = options.maxSpeed;

        // Resizes the canvas
        publicAPIs.resizeCanvas();

        // Pauses the simulation
        publicAPIs.pauseAnimation();

        // Updates the charge initial position
        particle.x = Math.round(width / 2);
        particle.y = Math.round(height / 2);

        // Sets the maximum number of stored events
        // eventsSize = Math.ceil(Math.sqrt(width ** 2 + height ** 2) / maxSpeed * 60) + 10;

        maxCellTimeTravel = 60// Math.ceil(10 * 1.4142 * cellSize * 60 / c);

        // Clear the velocities and events array (I avoided using fill)
        velocities.length = 0;
        velocities = [...Array(avgTime)].map(() => { return { x: 0, y: 0 }; });
        acceleration.length = 0;
        particleEvents = [...Array(eventsSize)].map(() => {
            return {
                x: particle.x,
                y: particle.y,
                accelerationAbs: 0,
                angle: 0
            };
        });

        // Restarts the simulation
        publicAPIs.playAnimation();
    }

    /*_______________________________________
    |   Canvas and listeners
    */

    const plot = new plotStructure(id, { alpha: false });
    const ctx = plot.getCtx();

    // Canvas listeners

    // On mouse down
    plotContainer.onmousedown = (e) => {
        if (e.button == 0) {
            mouseDown = true;
        }
    }

    // On mouse up
    plotContainer.onmouseup = (e) => {
        if (e.button == 0) {
            mouseDown = false;
        }
    }

    // On mouse move
    plotContainer.onmousemove = (e) => {
        mouse.x = e.clientX * dpi;
        mouse.y = e.clientY * dpi;
    }

    // On touch start
    plotContainer.ontouchstart = (e) => {
        mouseDown = true;
        storeTouchPosition(e);
    }

    // On touch end
    plotContainer.ontouchend = () => {
        mouseDown = false;
    }

    // On touch move
    plotContainer.ontouchmove = (e) => {
        storeTouchPosition(e);
    }

    /**
     * Stores the touch events.
     * @param {*} e Event
     */
    const storeTouchPosition = (e) => {
        e.preventDefault();
        let touches = e.changedTouches;

        mouse.x = touches[0].pageX * dpi;
        mouse.y = touches[0].pageY * dpi;
    }

    /**
     * Resizes the canvas to fill the HTML canvas element.
     */
    publicAPIs.resizeCanvas = () => {
        plot.resizeCanvas();

        // Gets width and height form the plot structure
        width = plot.getWidth();
        height = plot.getHeight();

        particle.x = Math.round(width / 2);
        particle.y = Math.round(height / 2);
    }

    /**
     * Toggles the simulation on and off.
     */
    publicAPIs.toggleAnimation = () => {
        running = !running;
        if (running) {
            // Starts the animation
            animate();
        }
    }

    /**
     * Pauses the simulation.
     */
    publicAPIs.pauseAnimation = () => {
        running = false;
    }

    /**
     * Starts the simulation.
     */
    publicAPIs.playAnimation = () => {
        running = true;
        // Starts the animation
        animate();
    }

    /**
     * A (probably poor) implementation of the pause-able loop.
     * @returns Early return if not playing.
     */
    function animate() {
        if (!running) {
            return;
        }

        // Updates the physics simulation
        updatePhysics();

        try {
            // Draws what has to be drawn
            publicAPIs.drawPlot();

        } catch (error) {
            console.log(error);
        }
        updatePhysicalPlots();
        // Keeps executing this function
        requestAnimationFrame(animate);
    }

    /**
     * If the simulation isn't running, it renders the next frame.
     */
    publicAPIs.nextFrame = () => {
        if (!running) {
            // Updates the physics simulation
            updatePhysics();

            try {
                // Draws what has to be drawn
                publicAPIs.drawPlot();
                updatePhysicalPlots();
            } catch (error) {
                console.log(error);
            }
        }
    }

    /*_______________________________________
    |   Simulation
    */

    /**
     * Updates the physics simulation.
     */
    function updatePhysics() {
        // Updates the velocity based on mouse/touch position
        if (mouseDown) {
            velocity.x = (mouse.x - particle.x) / 2;
            velocity.y = (mouse.y - particle.y) / 2;
        } else {
            velocity.x = Math.abs(velocity.x) > .5 ? .95 * velocity.x : 0;
            velocity.y = Math.abs(velocity.y) > .5 ? .95 * velocity.y : 0;
        }

        // Limits the velocity to 99% of the speed of light
        limitSpeed(.99 * maxSpeed);

        // Stores current velocity
        velocities.unshift({ x: velocity.x, y: velocity.y });
        // Limits the size of the stored velocities array
        if (velocities.length > avgTime - 1) velocities.pop();

        // Calculates acceleration
        acceleration.x = (velocities[0].x - velocities[avgTime - 1].x) / (avgTime - 1);
        acceleration.y = (velocities[0].y - velocities[avgTime - 1].y) / (avgTime - 1);

        // Changes particle position
        particle.x += .05 * velocity.x;
        particle.y += .05 * velocity.y;

        // Stores current acceleration
        particleEvents.unshift({
            x: particle.x,
            y: particle.y,
            xVelocity: velocity.x,
            yVelocity: velocity.y,
            xAcceleration: acceleration.x,
            yAcceleration: acceleration.y,
            velocityAbs: Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y),
            accelerationAbs: Math.sqrt(acceleration.x * acceleration.x + acceleration.y * acceleration.y),
            angle: Math.atan2(acceleration.x, acceleration.y)
        });
        // Limits the size of the stored accelerations array
        if (particleEvents.length > eventsSize) particleEvents.pop();
    }

    /**
     * Limits the current speed.
     * @param {*} maxVelocity Maximum speed.
     */
    const limitSpeed = (maxVelocity) => {
        // Calculates the velocity vector magnitude
        const velocityAbs = velocity.x * velocity.x + velocity.y * velocity.y;
        if (velocityAbs > maxVelocity * maxVelocity) {
            // Normalizes the velocity vector and multiply by maximum value
            velocity.x = velocity.x / Math.sqrt(velocityAbs) * maxVelocity;
            velocity.y = velocity.y / Math.sqrt(velocityAbs) * maxVelocity;
        }
    }

    /*_______________________________________
    |   Rendering
    */

    function updatePhysicalPlots() {
        physicalPlots.get('axis-position').setValues([
            particleEvents.map(particleEvents => (particleEvents.y - height / 2) / height),
            particleEvents.map(particleEvents => (particleEvents.x - width / 2) / width)
        ]);

        physicalPlots.get('axis-velocity').setValues([
            particleEvents.map(particleEvents => particleEvents.yVelocity),
            particleEvents.map(particleEvents => particleEvents.xVelocity)
        ]);

        physicalPlots.get('axis-acceleration').setValues([
            particleEvents.map(particleEvents => particleEvents.yAcceleration),
            particleEvents.map(particleEvents => particleEvents.xAcceleration)
        ]);

        physicalPlots.get('abs-velocity').setValues([
            particleEvents.map(particleEvents => particleEvents.velocityAbs)
        ]);

        physicalPlots.get('abs-acceleration').setValues([
            particleEvents.map(particleEvents => particleEvents.accelerationAbs)
        ]);

        physicalPlots.forEach(p => {
            p.drawPlot();
        });
    }

    /**
     * Draws the plot.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvas
        publicAPIs.clearPlot();

        ctx.beginPath();
        ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.lineWidth = 2;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x + velocity.x, particle.y + velocity.y);
        ctx.stroke();

        // Draws the acceleration vector
        ctx.beginPath();
        ctx.strokeStyle = "rgb(176, 26, 0)";
        ctx.lineWidth = 8;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x + 8 * acceleration.x, particle.y + 8 * acceleration.y);
        ctx.stroke();

        // Draws the charged particle
        ctx.beginPath();
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.arc(particle.x, particle.y, 10, 0, 360);
        ctx.fill();
    }

    /**
     * Clears the plot.
     */
    publicAPIs.clearPlot = () => {
        ctx.fillStyle = "#000000";

        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.fill();
    }

    /*_______________________________________
    |   Getters and setters
    */

    /**
     * Gets the simulations status.
     * @returns Ture if the simulation is running, false otherwise.
     */
    publicAPIs.isRunning = () => {
        return running;
    }

    // Runs the animation
    publicAPIs.update(options);
    animate();

    // Returns public methods
    return publicAPIs;
}