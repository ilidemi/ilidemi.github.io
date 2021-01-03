'use strict';

// Matrix math

function matrixByVector(m, v) {
    let result = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i] += m[i][j] * v[j];
        }
    }
    return result;
}

function matrixByMatrix(m1, m2) {
    let result = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                result[i][j] += m1[i][k] * m2[k][j];
            }
        }
    }
    return result;
}

function multiplyMatrices(_) {
    let accumulator = arguments[arguments.length - 1];
    for (let i = arguments.length - 2; i >= 0; i--) {
        accumulator = matrixByMatrix(arguments[i], accumulator);
    }
    return accumulator;
}

// Matrix transformations

function idMatrix() {
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

function translateMatrix(v) {
    return [
        [1, 0, 0, v[0]],
        [0, 1, 0, v[1]],
        [0, 0, 1, v[2]],
        [0, 0, 0, 1]
    ];
}

function rotateAroundXMatrix(angle) {
    return [
        [1, 0, 0, 0],
        [0, Math.cos(angle), Math.sin(angle), 0],
        [0, -Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];
}

function rotateAroundYMatrix(angle) {
    return [
        [Math.cos(angle), 0, Math.sin(angle), 0],
        [0, 1, 0, 0],
        [-Math.sin(angle), 0, Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];
}

function scaleMatrix(factor) {
    return [
        [factor, 0, 0, 0],
        [0, factor, 0, 0],
        [0, 0, factor, 0],
        [0, 0, 0, 1]
    ];
}

function leftTransformMatrix() {
    let projection = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ];
    var canvasRect = leftCanvas.getBoundingClientRect();
    return multiplyMatrices(
        projection,
        translateMatrix([canvasRect.width / 2, canvasRect.height / 2, 0]),
        rotateAroundYMatrix(-Math.PI / 6)
    );
}

function leftReverseTransformMatrix() {
    let unprojection = [
        [Math.cos(-Math.PI / 6), 0, 0, 0],
        [0, 1, 0, 0],
        [Math.sin(-Math.PI / 6), 0, 0, 0],
        [0, 0, 0, 1]
    ];
    var canvasRect = leftCanvas.getBoundingClientRect();
    return multiplyMatrices(
        unprojection,
        translateMatrix([-canvasRect.width / 2, -canvasRect.height / 2, 0]));
}

function leftCarefulReverseTransformMatrix() {
    let unprojection = [
        [Math.cos(Math.PI / 6 - Math.PI / 2), 0, 0, 0],
        [0, 1, 0, 0],
        [Math.sin(Math.PI / 6 - Math.PI / 2), 0, 0, 0],
        [0, 0, 0, 1]
    ]
    var canvasRect = leftCanvas.getBoundingClientRect();
    return multiplyMatrices(
        unprojection,
        translateMatrix([-canvasRect.width / 2, -canvasRect.height / 2, 0]));
}

function rightTransformMatrix() {
    let projection = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ]
    var canvasRect = rightCanvas.getBoundingClientRect();
    return multiplyMatrices(
        projection,
        translateMatrix([canvasRect.width / 2, canvasRect.height / 2, 0]),
        rotateAroundYMatrix(Math.PI / 6)
    );
}

function rightReverseTransformMatrix() {
    let unprojection = [
        [Math.cos(Math.PI / 6), 0, 0, 0],
        [0, 1, 0, 0],
        [Math.sin(Math.PI / 6), 0, 0, 0],
        [0, 0, 0, 1]
    ];
    var canvasRect = leftCanvas.getBoundingClientRect();
    return multiplyMatrices(
        unprojection,
        translateMatrix([-canvasRect.width / 2, -canvasRect.height / 2, 0]));
}

function rightCarefulReverseTransformMatrix() {
    let unprojection = [
        [Math.cos(-Math.PI / 6 + Math.PI / 2), 0, 0, 0],
        [0, 1, 0, 0],
        [Math.sin(-Math.PI / 6 + Math.PI / 2), 0, 0, 0],
        [0, 0, 0, 1]
    ]
    var canvasRect = rightCanvas.getBoundingClientRect();
    return multiplyMatrices(
        unprojection,
        translateMatrix([-canvasRect.width / 2, -canvasRect.height / 2, 0]));
}

function bottomTransformMatrix() {
    var canvasRect = bottomCanvas.getBoundingClientRect();
    var rotation = (bottomDragOffsetX || 0) / canvasRect.width;
    var clippedRotation = Math.min(0.25, Math.max(-0.25, rotation));
    var rotationAngle = Math.PI * (0.5 + 2 * clippedRotation);
    var rotationXAngle = -Math.PI / 6 * Math.sin(rotationAngle);
    var rotationYAngle = Math.PI / 6 * Math.cos(rotationAngle);
    return multiplyMatrices(
        translateMatrix([canvasRect.width / 2, canvasRect.height / 2, 0]),
        rotateAroundXMatrix(rotationXAngle),
        rotateAroundYMatrix(rotationYAngle),
        scaleMatrix(2 / 3)
    );
}

// Logic
const Tools = {
    DRAW: "draw",
    SELECT: "select"
};
const lineHandleRadius = 8;

const HandleType = {
    START: "start",
    END: "end"
}

let currentTool = Tools.DRAW;
let isPointerDown = false;
let highlightedLine = undefined;
let selectedLine = undefined;
let draggedHandle = undefined;
let dragOffset = undefined;
let prevHandlePosition = undefined;
let bottomDragInitialX = undefined;
let bottomDragOffsetX = undefined;
let lines = [];
let contexts = {};

function handleDrawClick(event) {
    drawButton.className = "selected";
    selectButton.className = "";
    leftCanvas.style.cursor = "crosshair";
    rightCanvas.style.cursor = "crosshair";
    currentTool = Tools.DRAW;
    highlightedLine = undefined;
    selectedLine = undefined;
    draggedHandle = undefined;
    redraw();
}

function handleSelectClick(event) {
    selectButton.className = "selected";
    drawButton.className = "";
    leftCanvas.style.cursor = "default";
    rightCanvas.style.cursor = "default";
    currentTool = Tools.SELECT;
}

function handleExamplesChange(event) {
    if (examplesSelect.value === 'load') {
        lines = [];
        redraw();
        return;
    }

    let exampleUrl = `./examples/${examplesSelect.value}.json`;
    fetch(exampleUrl)
        .then(response => response.json())
        .then(json => {
            lines = json;
            redraw();
        });
}

function redraw() {
    for (let canvasId in contexts) {
        let context = contexts[canvasId];
        let ctx = context.ctx;
        let transformMatrix = context.transformFunc();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let line of lines) {
            let start = matrixByVector(transformMatrix, line.start);
            let end = matrixByVector(transformMatrix, line.end);

            if (selectedLine == line || highlightedLine == line) {
                ctx.lineWidth = 3;
            }

            ctx.beginPath();
            ctx.moveTo(start[0], start[1]);
            ctx.lineTo(end[0], end[1]);
            ctx.stroke();
            ctx.lineWidth = 1;

            if (selectedLine == line) {
                if (context.isInteractive) {
                    ctx.fillStyle = '#c00000';
                    ctx.beginPath();
                    ctx.ellipse(start[0], start[1], lineHandleRadius, lineHandleRadius, 0, 0, 2 * Math.PI);
                    ctx.fill()
                    ctx.beginPath();
                    ctx.ellipse(end[0], end[1], lineHandleRadius, lineHandleRadius, 0, 0, 2 * Math.PI);
                    ctx.fill()
                }
            }
        }
    }
}

function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2) + Math.pow(a[3] - b[3], 2));
}

function addVectors(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2], 1];
}

function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2], 1];
}

function findLineHit(x, y, transformMatrix) {
    let hitRadius = 5;
    for (let line of lines) {
        let start = matrixByVector(transformMatrix, line.start);
        let end = matrixByVector(transformMatrix, line.end);
        if (x >= Math.min(start[0], end[0]) - hitRadius &&
            x <= Math.max(start[0], end[0]) + hitRadius &&
            y >= Math.min(start[1], end[1]) - hitRadius &&
            y <= Math.max(start[1], end[1]) + hitRadius
        ) {
            let distanceToLine = Math.abs(
                (end[1] - start[1]) * x -
                (end[0] - start[0]) * y +
                end[0] * start[1] -
                end[1] * start[0]
            ) / distance(start, end);
            if (distanceToLine <= hitRadius) {
                return line;
            }
        }
    }
    return undefined;
}

function handlePointerDown(event) {
    isPointerDown = true;
    let canvasId = event.currentTarget.id;
    if (event.currentTarget == leftCanvas || event.currentTarget == rightCanvas) {
        let pointerCoords = [event.offsetX, event.offsetY, 0, 1];
        switch (currentTool) {
            case Tools.DRAW:
                let reverseTransformMatrix = contexts[canvasId].reverseTransform;
                let start = matrixByVector(reverseTransformMatrix, pointerCoords);
                let end = matrixByVector(reverseTransformMatrix, pointerCoords);
                lines.push({ start: start, end: end });
                break;
            case Tools.SELECT:
                let transformMatrix = contexts[canvasId].transformFunc();

                if (selectedLine !== undefined) {
                    let start = matrixByVector(transformMatrix, selectedLine.start);
                    let end = matrixByVector(transformMatrix, selectedLine.end);
                    prevHandlePosition = pointerCoords;
                    if (distance(pointerCoords, start) <= lineHandleRadius) {
                        draggedHandle = HandleType.START;
                        dragOffset = subtractVectors(pointerCoords, start);
                        break;
                    }
                    if (distance(pointerCoords, end) <= lineHandleRadius) {
                        draggedHandle = HandleType.END;
                        dragOffset = subtractVectors(pointerCoords, end);
                        break;
                    }
                }

                selectedLine = undefined;
                draggedHandle = undefined;
                let lineHit = findLineHit(event.offsetX, event.offsetY, transformMatrix);
                if (lineHit !== undefined) {
                    selectedLine = lineHit;
                    highlightedLine = undefined;
                }
                break;

        }
    } else {
        bottomDragInitialX = event.offsetX;
        bottomDragOffsetX = 0;
    }
    redraw();
}

function handlePointerMove(event) {
    if (event.currentTarget == leftCanvas || event.currentTarget == rightCanvas) {
        let canvasId = event.currentTarget.id;
        if (isPointerDown) {
            let pointerCoords = [event.offsetX, event.offsetY, 0, 1];
            let reverseTransformMatrix = contexts[canvasId].reverseTransform;

            switch (currentTool) {
                case Tools.DRAW:
                    lines[lines.length - 1].end = matrixByVector(reverseTransformMatrix, pointerCoords);
                    break;
                case Tools.SELECT:
                    if (draggedHandle !== undefined) {
                        let carefulReverseTransformMatrix = contexts[canvasId].carefulReverseTransform;
                        let offsetVector = subtractVectors(
                            matrixByVector(carefulReverseTransformMatrix, pointerCoords),
                            matrixByVector(carefulReverseTransformMatrix, prevHandlePosition));
                        switch (draggedHandle) {
                            case HandleType.START:
                                selectedLine.start = addVectors(offsetVector, selectedLine.start);
                                break;
                            case HandleType.END:
                                selectedLine.end = addVectors(offsetVector, selectedLine.end);
                                break;
                        }
                        prevHandlePosition = pointerCoords;
                    }
            }
            redraw();
        } else {
            if (currentTool === Tools.SELECT) {
                let transformMatrix = contexts[canvasId].transformFunc();
                highlightedLine = findLineHit(event.offsetX, event.offsetY, transformMatrix);
                redraw();
            }
        }
    } else {
        if (isPointerDown) {
            bottomDragOffsetX = event.offsetX - bottomDragInitialX;
            redraw();
        }
    }
}

function handlePointerRelease(event) {
    isPointerDown = false;
    if (event.currentTarget == leftCanvas || event.currentTarget == rightCanvas) {
        draggedHandle = undefined;
        prevHandlePosition = undefined;
    } else {
        bottomDragInitialX = undefined;
        bottomDragOffsetX = undefined;
        redraw();
    }
}

function setupCanvasScale(canvas) {
    let dpr = window.devicePixelRatio || 1;
    let rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    let ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
}

function addPointerEventListeners(canvas) {
    canvas.addEventListener("pointerdown", handlePointerDown, false);
    canvas.addEventListener("pointermove", handlePointerMove, false);
    canvas.addEventListener("pointerup", handlePointerRelease, false);
    canvas.addEventListener("pointerout", handlePointerRelease, false);
}

let leftCanvas = document.getElementById("leftCanvas");
let rightCanvas = document.getElementById("rightCanvas");
let bottomCanvas = document.getElementById("bottomCanvas");

addPointerEventListeners(leftCanvas);
addPointerEventListeners(rightCanvas);
addPointerEventListeners(bottomCanvas);

function setupCanvases() {
    contexts["leftCanvas"] = {
        ctx: setupCanvasScale(leftCanvas),
        transformFunc: leftTransformMatrix,
        reverseTransform: leftReverseTransformMatrix(),
        carefulReverseTransform: leftCarefulReverseTransformMatrix(),
        isInteractive: true
    };
    contexts["rightCanvas"] = {
        ctx: setupCanvasScale(rightCanvas),
        transformFunc: rightTransformMatrix,
        reverseTransform: rightReverseTransformMatrix(),
        carefulReverseTransform: rightCarefulReverseTransformMatrix(),
        isInteractive: true
    };
    contexts["bottomCanvas"] = {
        ctx: setupCanvasScale(bottomCanvas),
        transformFunc: bottomTransformMatrix,
        isInteractive: false
    };
}

setupCanvases();

function handleWindowResize(event) {
    setupCanvases();
    redraw();
}
window.addEventListener("resize", handleWindowResize);

let drawButton = document.getElementById("drawButton");
drawButton.addEventListener("click", handleDrawClick);

let selectButton = document.getElementById("selectButton");
selectButton.addEventListener("click", handleSelectClick);

let examplesSelect = document.getElementById("examples");
examplesSelect.addEventListener("change", handleExamplesChange)

function onKeyDown(event) {
    if (event.key === "z" && event.ctrlKey) {
        isPointerDown = false;
        let deletedLine = lines.pop();
        if (selectedLine == deletedLine) {
            selectedLine = undefined;
            draggedHandle = undefined;
        }
        if (highlightedLine == deletedLine) {
            highlightedLine = undefined;
        }
        redraw();
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedLine !== undefined) {
            isPointerDown = false;
            lines.splice(lines.indexOf(selectedLine), 1);
            selectedLine = undefined;
            draggedHandle = undefined;
            redraw();
        }
    }
}

document.addEventListener("keydown", onKeyDown);