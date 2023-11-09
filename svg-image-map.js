let svgNS = "http://www.w3.org/2000/svg";
let svgCanvas = document.getElementById('svgCanvas');
let outputArea = document.getElementById('output');
let selectedElement, currentPolygon, currentDeleteBtn, offsetX, offsetY;
let isDrawing = false, isDragging = false, isShiftDown = false;

svgCanvas.addEventListener('mousedown', onMouseDown);
svgCanvas.addEventListener('mousemove', onMouseMove);
svgCanvas.addEventListener('mouseup', onMouseUp);
svgCanvas.addEventListener('mouseleave', onMouseLeave);
svgCanvas.addEventListener('contextmenu', onContextMenu);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function onMouseDown(evt) {
  if (evt.target === svgCanvas && isShiftDown) {
    isDrawing = true;
    currentPolygon = createPolygon(evt);
  } else if (evt.target.classList.contains('draggable')) {
    isDragging = true;
    selectedElement = evt.target.parentNode;
    currentDeleteBtn = selectedElement.querySelector('.delete-btn');
    offsetX = evt.clientX - parseFloat(selectedElement.getAttribute('data-x') || 0);
    offsetY = evt.clientY - parseFloat(selectedElement.getAttribute('data-y') || 0);
  }
}

function onMouseMove(evt) {
  if (isDrawing && isShiftDown) {
    updatePolygon(evt);
  } else if (isDragging && selectedElement) {
    moveElement(evt);
  }
}

function onMouseUp(evt) {
  if (isShiftDown && isDrawing) {
    
    addPointToPolygon(evt);
  } else {
    isDragging = false;
    isDrawing = false;
    selectedElement = null;
    currentDeleteBtn = null;
  }
}

function onMouseLeave(evt) {
  isDragging = false;
  isDrawing = false;
}

function onContextMenu(evt) {
  if (evt.target.classList.contains('draggable')) {
    evt.preventDefault();
    let polygon = evt.target;
    let url = prompt('URL:');
    if (url !== null) {
      polygon.setAttribute('data-url', url);
      updateOutput();
    }
  }
}

function onKeyDown(evt) {
  if (evt.key === 'Shift') {
    isShiftDown = true;
  }
}

function onKeyUp(evt) {
  if (evt.key === 'Shift') {
    isShiftDown = false;
    if (isDrawing) {
      finishDrawing();
    }
  }
}

function getMousePosition(evt) {
  let CTM = svgCanvas.getScreenCTM();
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  };
}

function createPolygon(evt) {
  let mousePos = getMousePosition(evt);
  let polygon = document.createElementNS(svgNS, 'polygon');
  polygon.setAttributeNS(null, 'points', `${mousePos.x},${mousePos.y}`);
  polygon.setAttributeNS(null, 'stroke', 'blue');
  polygon.setAttributeNS(null, 'fill', 'rgba(0, 0, 255, 0.1)');
  polygon.classList.add('draggable');
  polygon.setAttribute('data-x', 0);
  polygon.setAttribute('data-y', 0);

  let g = document.createElementNS(svgNS, 'g');
  g.appendChild(polygon);
  svgCanvas.appendChild(g);

  let deleteBtn = createDeleteButton(mousePos);
  g.appendChild(deleteBtn);

  return polygon;
}

function updatePolygon(evt) {
  let mousePos = getMousePosition(evt);
  let points = currentPolygon.getAttributeNS(null, 'points');
  currentPolygon.setAttributeNS(null, 'points', points + ` ${mousePos.x},${mousePos.y}`);
  updateOutput();
}

function createDeleteButton(mousePos) {
  let deleteBtn = document.createElementNS(svgNS, 'circle');
  deleteBtn.setAttributeNS(null, 'cx', mousePos.x);
  deleteBtn.setAttributeNS(null, 'cy', mousePos.y);
  deleteBtn.setAttributeNS(null, 'r', 5);
  deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click', function() {
    svgCanvas.removeChild(this.parentNode);
    updateOutput();
  });
  return deleteBtn;
}

function moveElement(evt) {
  let dx = evt.clientX - offsetX;
  let dy = evt.clientY - offsetY;
  selectedElement.setAttribute('transform', `translate(${dx}, ${dy})`);
  selectedElement.setAttribute('data-x', dx);
  selectedElement.setAttribute('data-y', dy);
  updateOutput();
}

function addPointToPolygon(evt) {
  let mousePos = getMousePosition(evt);
  let points = currentPolygon.getAttributeNS(null, 'points');
  currentPolygon.setAttributeNS(null, 'points', points + ` ${mousePos.x},${mousePos.y}`);
  moveDeleteButton(currentDeleteBtn, mousePos);
}

function finishDrawing() {
  isDrawing = false;
  currentPolygon = null;
}

function moveDeleteButton(deleteBtn, mousePos) {
  deleteBtn.setAttributeNS(null, 'cx', mousePos.x);
  deleteBtn.setAttributeNS(null, 'cy', mousePos.y);
}

function updateOutput() {
  outputArea.value = svgCanvas.innerHTML;
}

updateOutput();