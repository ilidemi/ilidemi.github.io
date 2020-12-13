'use strict';

// Matrix math

function matrixByVector(m, v) {
    var result = [0, 0, 0, 0];
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            result[i] += m[i][j] * v[j];
        }
    }
    return result;
}

function matrixByMatrix(m1, m2) {
    var result = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            for (var k = 0; k < 4; k++) {
                result[i][j] += m1[i][k] * m2[k][j];
            }
        }
    }
    return result;
}

function multiplyMatrices(_) {
    var accumulator = arguments[arguments.length - 1];
    for (var i = arguments.length - 2; i >= 0; i--) {
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
    var projection = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrices(
        projection,
        translateMatrix([424, 224, 0]),
        rotateAroundYMatrix(-Math.PI / 6)
    );
}

function leftReverseTransformMatrix() {
    var unprojection = [
        [Math.cos(-Math.PI / 6), 0, 0, 0],
        [0, 1, 0, 0],
        [Math.sin(-Math.PI / 6), 0, 0, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrices(
        unprojection,
        translateMatrix([-424, -224, 0]));
}

function leftCarefulReverseTransformMatrix() {
    var unprojection = [
        [Math.cos(Math.PI / 6 - Math.PI / 2), 0, 0, 0],
        [0, 1, 0, 0],
        [Math.sin(Math.PI / 6 - Math.PI / 2), 0, 0, 0],
        [0, 0, 0, 1]
    ]
    return multiplyMatrices(
        unprojection,
        translateMatrix([-424, -224, 0]));
}

function rightTransformMatrix() {
    var projection = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ]
    return multiplyMatrices(
        projection,
        translateMatrix([424, 224, 0]),
        rotateAroundYMatrix(Math.PI / 6)
    );
}

function rightReverseTransformMatrix() {
    var unprojection = [
        [Math.cos(Math.PI / 6), 0, 0, 0],
        [0, 1, 0, 0],
        [Math.sin(Math.PI / 6), 0, 0, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrices(
        unprojection,
        translateMatrix([-424, -224, 0]));
}

function rightCarefulReverseTransformMatrix() {
    var unprojection = [
        [Math.cos(-Math.PI / 6 + Math.PI / 2), 0, 0, 0],
        [0, 1, 0, 0],
        [Math.sin(-Math.PI / 6 + Math.PI / 2), 0, 0, 0],
        [0, 0, 0, 1]
    ]
    return multiplyMatrices(
        unprojection,
        translateMatrix([-424, -224, 0]));
}

function bottomTransformMatrix() {
    return multiplyMatrices(
        translateMatrix([860.5, 224, 0]),
        rotateAroundXMatrix(-Math.PI / 6),
        scaleMatrix(2/3)
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

var currentTool = Tools.DRAW;
var isPointerDown = false;
var selectedLine = undefined;
var draggedHandle = undefined;
var dragOffset = undefined;
var prevHandlePosition = undefined;
var lines = [];
var contexts = {};

function handleDrawClick(event) {
    drawButton.className = "selected";
    selectButton.className = "";
    currentTool = Tools.DRAW;
    selectedLine = undefined;
    draggedHandle = undefined;
    redraw();
}

function handleSelectClick(event) {
    selectButton.className = "selected";
    drawButton.className = "";
    currentTool = Tools.SELECT;
}

function redraw() {
    for (var canvasId in contexts) {
        var context = contexts[canvasId];
        var ctx = context.ctx;
        var transformMatrix = context.transform;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (var line of lines) {
            var start = matrixByVector(transformMatrix, line.start);
            var end = matrixByVector(transformMatrix, line.end);

            if (selectedLine == line) {
                ctx.lineWidth = 3;
            }
            
            ctx.beginPath();
            ctx.moveTo(start[0], start[1]);
            ctx.lineTo(end[0], end[1]);
            ctx.stroke();

            if (selectedLine == line) {
                ctx.lineWidth = 1;
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

function handlePointerDown(event) {
    isPointerDown = true;
    var canvasId = event.currentTarget.id;
    var pointerCoords = [event.offsetX, event.offsetY, 0, 1];
    switch (currentTool) {
        case Tools.DRAW:
            var reverseTransformMatrix = contexts[canvasId].reverseTransform;
            var start = matrixByVector(reverseTransformMatrix, pointerCoords);
            var end = matrixByVector(reverseTransformMatrix, pointerCoords);
            lines.push({ start: start, end: end });
            break;
        case Tools.SELECT:
            var transformMatrix = contexts[canvasId].transform;

            if (selectedLine !== undefined) {
                var start = matrixByVector(transformMatrix, selectedLine.start);
                var end = matrixByVector(transformMatrix, selectedLine.end);
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
            var hitRadius = 5;
            for (var line of lines) {
                var start = matrixByVector(transformMatrix, line.start);
                var end = matrixByVector(transformMatrix, line.end);
                if (event.offsetX >= Math.min(start[0], end[0]) - hitRadius &&
                    event.offsetX <= Math.max(start[0], end[0]) + hitRadius &&
                    event.offsetY >= Math.min(start[1], end[1]) - hitRadius &&
                    event.offsetY <= Math.max(start[1], end[1]) + hitRadius
                ) {
                    var distanceToLine = Math.abs(
                            (end[1] - start[1]) * event.offsetX - 
                            (end[0] - start[0]) * event.offsetY +
                            end[0] * start[1] -
                            end[1] * start[0]
                        ) / distance(start, end)
                    if (distanceToLine <= hitRadius) {
                        selectedLine = line;
                        break;
                    }
                }
            }
            break;

    }
    redraw();
}

function handlePointerMove(event) {
    if (isPointerDown) {
        var canvasId = event.currentTarget.id;
        var pointerCoords = [event.offsetX, event.offsetY, 0, 1];
        var reverseTransformMatrix = contexts[canvasId].reverseTransform;

        switch(currentTool) {
            case Tools.DRAW:
                lines[lines.length - 1].end = matrixByVector(reverseTransformMatrix, pointerCoords);
                break;
            case Tools.SELECT:
                if (draggedHandle !== undefined) {
                    var carefulReverseTransformMatrix = contexts[canvasId].carefulReverseTransform;
                    var offsetVector = subtractVectors(
                        matrixByVector(carefulReverseTransformMatrix, pointerCoords),
                        matrixByVector(carefulReverseTransformMatrix, prevHandlePosition));
                    switch(draggedHandle) {
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
    }
}

function handlePointerRelease(event) {
    isPointerDown = false;
    draggedHandle = undefined;
    prevHandlePosition = undefined;
}

function setupCanvasScale(canvas) {
    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;
    // Get the size of the canvas in CSS pixels.
    var rect = canvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    var ctx = canvas.getContext('2d');
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);
    return ctx;
}

function addPointerEventListeners(canvas)
{
    canvas.addEventListener("pointerdown", handlePointerDown, false);
    canvas.addEventListener("pointermove", handlePointerMove, false);
    canvas.addEventListener("pointerup", handlePointerRelease, false);
    canvas.addEventListener("pointerout", handlePointerRelease, false);
}

var leftCanvas = document.getElementById("leftCanvas");
var rightCanvas = document.getElementById("rightCanvas");
var bottomCanvas = document.getElementById("bottomCanvas");

addPointerEventListeners(leftCanvas);
addPointerEventListeners(rightCanvas);
// bottom canvas is not interactive

contexts["leftCanvas"] = {
    ctx: setupCanvasScale(leftCanvas),
    transform: leftTransformMatrix(),
    reverseTransform: leftReverseTransformMatrix(),
    carefulReverseTransform: leftCarefulReverseTransformMatrix(),
    isInteractive: true
};
contexts["rightCanvas"] = {
    ctx: setupCanvasScale(rightCanvas),
    transform: rightTransformMatrix(),
    reverseTransform: rightReverseTransformMatrix(),
    carefulReverseTransform: rightCarefulReverseTransformMatrix(),
    isInteractive: true
};
contexts["bottomCanvas"] = {
    ctx: setupCanvasScale(bottomCanvas),
    transform: bottomTransformMatrix(),
    isInteractive: false
};

var drawButton = document.getElementById("drawButton");
var selectButton = document.getElementById("selectButton");

function onKeyDown(event) {
    if (event.key === "z" && event.ctrlKey) {
        isPointerDown = false;
        var deletedLine = lines.pop();
        if (selectedLine == deletedLine) {
            selectedLine = undefined;
            draggedHandle = undefined;
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