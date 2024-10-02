/**
 * Plot of electromagnetic wave.
 * @param {Number} id Id of the signal plot.
 * @param {*} options Options for the simulation.
 * @returns Public APIs.
 */
let physicalPlot = function (id) {

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

    let values = [];

    let scale = options.scale;

    let yStartingPoint = options.yStartingPoint;

    let color = options.color;

    /*_______________________________________
    |   Plot update
    */

    /**
     * Updates the plot.
     * @param {*} options Options for the simulation.
     */
    publicAPIs.update = function () {
        // Resizes the canvas
        publicAPIs.resizeCanvas();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;

        // Restarts the simulation
        publicAPIs.playAnimation();
    }

    /*_______________________________________
    |   Canvas and listeners
    */

    const plot = new plotStructure(id, { alpha: false });
    const ctx = plot.getCtx();

    /**
     * Resizes the canvas to fill the HTML canvas element.
     */
    publicAPIs.resizeCanvas = () => {
        plot.resizeCanvas();

        // Gets width and height form the plot structure
        width = plot.getWidth();
        height = plot.getHeight();
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

        try {
            // Draws what has to be drawn
            publicAPIs.drawPlot();
        } catch (error) {
            console.log(error);
        }
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
            } catch (error) {
                console.log(error);
            }
        }
    }

    /*_______________________________________
    |   Rendering
    */

    /**
     * Acceleration of the charge (may be a retarded acceleration).
     */
    let particleAcceleration;

    /**
     * Draws the plot.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvas
        publicAPIs.clearPlot();

        ctx.beginPath();
        ctx.moveTo(width + 1, yStartingPoint * height);
        for (let i = 0; i < values.length; i = i + 2) {
            ctx.lineTo(
                width - width * i / values.length,
                yStartingPoint * height - values[i] * scale)
        }
        ctx.stroke();
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

    publicAPIs.setValues = (newValues) => {
        values = newValues;
    }

    // Runs the animation
    publicAPIs.update();
    animate();

    // Returns public methods
    return publicAPIs;
}