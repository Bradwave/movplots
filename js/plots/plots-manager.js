/**
 * Manages plots, sort of...
 * @returns Public APIs.
 */
const plotsManager = new function () {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /**
     * Number of milliseconds to wait after resizing.
     * @type {Number}
     */
    const waitTime = 300;

    let resizeTimeout;

    /**
     * Plot containers.
     */
    const canvases = [...document.getElementsByName("plot")];

    /**
     * Spinning loaders.
     */
    const loaders = [...document.getElementsByName("plot-loader")];

    /**
     * Button to play and pause the simulation.
     */
    const playPauseButton = document.getElementById("play-pause");

    /**
     * Button to play the next frame of the simulation.
     */
    const nextFrameButton = document.getElementById("next-frame");

    /**
     * Speed of light.
     */
    let maxSpeed = 600;

    /**
     * Plots.
     */
    let physicalPlots = new Map();
    let mainPlot;

    // Creates the plots.
    publicAPIs.createPlots = function () {
        physicalPlots.set(
            'axis-position',
            new physicalPlot("axis-position", options = {
                maxNumOfValues: 300,
                scale: 100,
                yStartingPoint: .5,
                colors: ["rgb(180, 180, 180)", "rgb(120, 120, 120)"]
            })
        );
        physicalPlots.set(
            'axis-velocity',
            new physicalPlot("axis-velocity", options = {
                maxNumOfValues: 300,
                scale: .1,
                yStartingPoint: .5,
                colors: ["rgb(255, 255, 255)", "rgb(150, 150, 150)"]
            })
        );
        physicalPlots.set(
            'axis-acceleration',
            new physicalPlot("axis-acceleration", options = {
                maxNumOfValues: 300,
                scale: 3,
                yStartingPoint: .5,
                colors: ["rgb(176, 26, 0)", "rgb(110, 16, 0)"]
            })
        );
        physicalPlots.set(
            'abs-velocity',
            new physicalPlot("abs-velocity", options = {
                maxNumOfValues: 300,
                scale: .2,
                yStartingPoint: .9,
                colors: ["rgb(255, 255, 255)"]
            })
        );
        physicalPlots.set(
            'abs-acceleration',
            new physicalPlot("abs-acceleration", options = {
                maxNumOfValues: 300,
                scale: 3,
                yStartingPoint: .9,
                colors: ["rgb(176, 26, 0)"]
            })
        );

        // Creates the particle plot
        mainPlot = new particlePlot("particle", {
            maxSpeed: maxSpeed,
            plotContainer: document.getElementById("plot-container"),
            physicalPlots: physicalPlots
        });
    }

    /**
     * Updates the plots.
     */
    publicAPIs.update = function () {
        updateInputBoxes();

        // Updates the particle plot
        mainPlot.update({
            maxSpeed: maxSpeed,
        });
    }

    // On window resize
    window.onresize = () => {
        changePlots();
    }

    // Sets the loading mode
    function setLoadingStyle(isLoading) {
        if (isLoading) {
            canvases.forEach((canvas) => {
                // Hides the canvases
                canvas.style.opacity = 0;
                canvas.style.visibility = "hidden";
            });

            loaders.forEach(loader => {
                // Displays the loader while waiting
                loader.style.opacity = 1;
                loader.style.visibility = "visible";
                loader.style.animationPlayState = "running";
            });
        } else {
            canvases.forEach((canvas, i) => {
                // Displays the canvases
                canvas.style.opacity = 1;
                canvas.style.visibility = "visible";
            });

            loaders.forEach(loader => {
                // Hides the loader
                loader.style.opacity = 0;
                loader.style.visibility = "hidden";
                loader.style.animationPlayState = "paused";
            });
        }
    }

    /*_______________________________________
    |   Inputs for the plots
    */

    /**
     * Ids of input boxes for the plots.
     */
    let inputIds = [
        'max-speed'
    ];

    /**
     * Input boxes for the plots.
     */
    let plotInputs = new Map();

    // Creates the input map
    // inputIds.forEach((id) => {
    //     plotInputs.set(id, document.getElementById(id));
    // });

    // Sets listeners for input boxes
    plotInputs.forEach((input) => {
        input.onkeyup = (e) => {
            if (e.code === "Enter" && !e.ctrlKey) {
                changePlots();
            }
        }

        input.onchange = () => {
            changePlots();
        }
    });

    // Updates the parameters when ctrl+Enter is pressed
    document.onkeyup = (e) => {
        if (e.ctrlKey && e.code === "Enter") {
            changePlots();
        }
    }

    /**
     * Updates the input boxes and the respective variables.
     */
    function updateInputBoxes() {
        maxSpeed = constrain(getInputNumber(plotInputs, 'max-speed'), 50, Infinity);
    }

    /**
     * Update plot when input boxes change.
     */
    function changePlots() {
        mainPlot.pauseAnimation();
        mainPlot.clearPlot();

        physicalPlots.forEach(plot => {
            // Pauses the animation
            plot.pauseAnimation();
            // Clears the canvas
            plot.clearPlot();
        });

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setLoadingStyle(false);

            publicAPIs.update();
        }, waitTime);
    }

    /*_______________________________________
    |   Buttons and key listeners
    */

    // On key down
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case "KeyP":
                // Turns play button into pause and viceversa
                mainPlot.toggleAnimation();
                physicalPlots.forEach(plot => {
                    plot.toggleAnimation();
                })
                playPauseButton.innerHTML = mainPlot.isRunning() ? "pause" : "play_arrow";
                break;
            case "KeyN":
                mainPlot.nextFrame();
                // Plays the next frame
                physicalPlots.forEach(plot => {
                    plot.nextFrame();
                })
                break;
        }
    });

    // Plays and pauses the simulation
    playPauseButton.onclick = () => {
        mainPlot.toggleAnimation();
        physicalPlots.forEach(plot => {
            plot.toggleAnimation();
        })
        playPauseButton.innerHTML = mainPlot.isRunning() ? "pause" : "play_arrow";
    }

    // Advances the simulation to the next frame
    nextFrameButton.onclick = () => {
        mainPlot.toggleAnimation();
        mainPlot.nextFrame();
    }

    /**
     * Converts the input value to float and sets the input box value.
     * @param {*} id Id of the input box. 
     * @returns Returns the float value of the input box.
     */
    const getInputNumber = (inputsMap, id) => {
        let newValue = parseFloat(inputsMap.get(id).value);
        inputsMap.get(id).value = newValue;
        return newValue;
    }

    return publicAPIs;
}