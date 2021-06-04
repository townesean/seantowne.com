const ALIVE_COLOR = "#90c482";
const DEAD_COLOR = "white";
const WIDTH_OF_CANVAS_IN_PIXELS = 900*devicePixelRatio; // pixels
const HEIGHT_OF_CANVAS_IN_PIXELS = 450*devicePixelRatio; // pixels
const WIDTH_OF_GAME_IN_CELLS = 300; // cells
const HEIGHT_OF_GAME_IN_CELLS = 150; // cells
const DEFAULT_ANIMATION_DELAY = 100; // ms
const DEFAULT_CELL_SIZE = 15; // pixels
const MIN_CELL_SIZE = 3; // pixels
const MAX_CELL_SIZE = 50; // pixels

class Grid {
	constructor(width, height, cellSize, parentID){
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext('2d');
		this.cellSize = cellSize;
		let dpr = devicePixelRatio;
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = width/dpr + "px";
		this.canvas.style.height = height/dpr + "px";
		this.canvas.style.borderStyle = "solid";
		this.canvas.style.borderWidth = "1px";
		this.ctx.scale(dpr,dpr);
		document.getElementById(parentID).appendChild(this.canvas);
	}

	addEventListener(eventName, action){
		this.canvas.addEventListener(eventName, action);
	}

	eventCoordinants(event){
		const rect = this.canvas.getBoundingClientRect();
		let x = event.clientX - rect.left;
		let y = event.clientY - rect.top;
		x = Math.floor(x/this.cellSize);
		y = Math.floor(y/this.cellSize);
		return {x, y};
	}

	verticleLine(x){
		this.ctx.beginPath();
		this.ctx.strokeStyle = "#FFFFFF";
		this.ctx.lineWidth = 1;
		this.ctx.moveTo(x, 0);
		this.ctx.lineTo(x, this.canvas.height);
		this.ctx.stroke(); 
	}

	horizontalLine(y){
		this.ctx.beginPath();
		this.ctx.strokeStyle = "#FFFFFF";
		this.ctx.lineWidth = 1;
		this.ctx.moveTo(0, y);
		this.ctx.lineTo(this.canvas.width, y);
		this.ctx.stroke();
	}

	clear(){
		this.ctx.fillStyle = DEAD_COLOR;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.beginPath();
		this.ctx.stroke();
	}

	blankGrid(){
		this.clear();
		
		for (let i=0; i < this.canvas.height; i+=this.cellSize){
			this.horizontalLine(i);
		}
		for (let i=0; i < this.canvas.width; i+=this.cellSize){
			this.verticleLine(i);
		}
	}

	drawCell(x, y, alive){
		this.ctx.beginPath();
		let color = alive? ALIVE_COLOR : DEAD_COLOR;
		this.ctx.fillStyle = color;
		//this.ctx.lineWidth = 0.1;
		this.ctx.strokeStyle = "#ffffff";
		this.ctx.rect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
		this.ctx.fill();
		this.ctx.stroke();
	}

	// constrict to only visible cells
	updateChangedCells(changes){
		changes.map((change)=>{
			this.drawCell(change.x, change.y, change.alive);
		});
	}

	drawCells(cells){
		this.blankGrid();
		cells.map((change)=>{
			this.drawCell(change.x, change.y, change.alive);
		});
	}

}

class Game {
	constructor(
		widthInPixels, 
		heightInPixels,
		widthInCells,
		heightInCells,
		cellSize,
		delay
	){
		this.widthInCells = widthInCells+1000;
		this.heightInCells = heightInCells+1000;
		this.widthInPixels = widthInPixels;
		this.heightInPixels = heightInPixels;
		this.cellSize = cellSize;

		this.bitmap = this.makeEmptyBitmap(true);
		this.grid = new Grid(widthInPixels, heightInPixels, cellSize, 'gol');
		this.grid.blankGrid();
		let cells = this.getCells(this.bitmap);
		this.grid.updateChangedCells(cells);
		
		this.grid.addEventListener('wheel', this.handleWheel);
		this.grid.addEventListener('mousedown', this.handleMouseDown);
		this.grid.addEventListener('mouseup', this.handleMouseUp);
		this.grid.addEventListener('mousemove', this.handleMouseMove);
		this.grid.addEventListener('mouseleave', this.handleMouseLeave);
		//document.addEventListener('keydown', this.handleKeyPress);

		this.delay = delay;
		this.running = false;
		this.runPause = document.createElement("button");
		this.runPause.innerHTML = "Run";
		this.runPause.addEventListener('click', this.handleRunPause);
		document.getElementById("gol").appendChild(this.runPause);

		this.random = document.createElement("button");
		this.random.innerHTML = "Random";
		this.random.addEventListener('click', this.handleRandom);
		document.getElementById("gol").appendChild(this.random);

		
	}


	viewRecDim(){
		return {
			w: Math.floor(this.widthInPixels/this.cellSize/devicePixelRatio),
			h: Math.floor(this.heightInPixels/this.cellSize/devicePixelRatio)
		}
	}

	getViewingRectangle(){
		if (!this.viewingRectangle){
			// center of world
			let center = { 
				x: Math.floor(this.widthInCells/2),
				y: Math.floor(this.heightInCells/2)
			}
			// rectangle with 'center' at center
			let viewingRectangle = {
				left  : center.x - Math.floor(this.viewRecDim().w/2),
				top   : center.y - Math.floor(this.viewRecDim().h/2),
				right : center.x + Math.floor(this.viewRecDim().w/2),
				bottom: center.y + Math.floor(this.viewRecDim().h/2)
			};
			this.viewingRectangle = viewingRectangle;
		}
		return {
			left  : this.viewingRectangle.left,
			top   : this.viewingRectangle.top,
			right : this.viewingRectangle.right,
			bottom: this.viewingRectangle.bottom
		}
	}

	setViewingRectangle(vr){
		// vr should be a modified copy of this.getViewingRectangle()
		let w = vr.right - vr.left;
		let h = vr.bottom - vr.top;

		if ( vr.left <= 0 ) {
			vr.left = 0;
			vr.right = vr.left + w;
		}
		if ( vr.right >= this.widthInCells ) {
			vr.right = this.widthInCells;
			vr.left = vr.right - w;
		}
		if ( vr.top <= 0 ) {
			vr.top = 0;
			vr.bottom = vr.top + h;
		}
		if ( vr.bottom >= this.heightInCells) {
			vr.bottom = this.heightInCells;
			vr.top = vr.bottom - h;
		}
		this.viewingRectangle = {
			left: vr.left,
			top: vr.top,
			right:vr.right,
			bottom:vr.bottom
		}
	}

	handleMouseLeave = (event) => {
		this.mousedownPosition = null;
	}

	handleKeyPress = (event) => {
		console.log(event);
	}

	mousedownPosition = null;
	handleMouseDown = (event) => {
		this.mousedownPosition = this.grid.eventCoordinants(event);
		this.dragingPos1 = this.mousedownPosition;
	}

	mouseupPosition = null;
	handleMouseUp = (event) => {
		if(!this.mousedownPosition)return;
		
		this.mouseupPosition = this.grid.eventCoordinants(event);

		let drag = (
			this.mouseupPosition.x != this.mousedownPosition.x || 
			this.mouseupPosition.y != this.mousedownPosition.y
		);

		if (!drag){
			this.handleCellClick(event);
		}
		this.mousedownPosition = null;
	}

	dragingPos0 = null;
	dragingPos1 = null;
	handleMouseMove = (event) => {
		if (!this.mousedownPosition) return;

		this.dragingPos0 = this.dragingPos1;
		this.dragingPos1 = this.grid.eventCoordinants(event);

		let draggedToDifferentCell = (
			this.dragingPos1.x != this.dragingPos0.x ||
			this.dragingPos1.y != this.dragingPos0.y
		);

		if (draggedToDifferentCell){
			let delta = {
				x: this.dragingPos1.x - this.dragingPos0.x,
				y: this.dragingPos1.y - this.dragingPos0.y
			};
			//console.log(delta);
			this.translateView(delta);
		}
	}

	translateView(delta){
		let vr = this.getViewingRectangle();
		vr.left -= delta.x;
		vr.top -= delta.y;
		vr.right -= delta.x;
		vr.bottom -= delta.y;
		this.setViewingRectangle(vr)
		this.redrawGrid();
	}

	redrawGrid(){
		this.grid.blankGrid();
		this.grid.updateChangedCells(this.getCells(this.bitmap));
	}

	scaleView(out){
		let scaleFactor = out?0.95:1.05;

		if(this.cellSize == MIN_CELL_SIZE && out)return;
		if(this.cellSize == MAX_CELL_SIZE && !out)return;

		let newSize = this.cellSize * scaleFactor;
		if (newSize < MIN_CELL_SIZE) newSize = MIN_CELL_SIZE;
		if (newSize > MAX_CELL_SIZE) newSize = MAX_CELL_SIZE;

		let vr = this.getViewingRectangle();
		let oldDim = this.viewRecDim();
		let center = {
			x: vr.left + Math.floor(oldDim.w/2),
			y: vr.top + Math.floor(oldDim.h/2)
		}
		// vr width * cellsize should always = width in pixels
		// vr width = width in pixels / cell size
		this.cellSize = newSize;
		this.grid.cellSize = newSize;
		let newDim = this.viewRecDim();

		vr.left = center.x - Math.floor(newDim.w/2);
		vr.right = center.x + Math.floor(newDim.w/2);
		vr.top = center.y - Math.floor(newDim.h/2);
		vr.bottom = center.y + Math.floor(newDim.h/2);

		let scaled = this.setViewingRectangle(vr);
		this.redrawGrid();
	}

	handleWheel = (event) => {
		let out = event.deltaY > 0;
		this.scaleView(out);
	}

	handleCellClick = (event) => {
		let square = this.grid.eventCoordinants(event);
		let vr = this.getViewingRectangle();
		let cellLoc = {
			x: square.x + vr.left,
			y: square.y + vr.top
		}

		if (
			cellLoc.x >= this.widthInCells || 
			cellLoc.y >= this.heightInCells
		)return;

		let cell = this.bitmap[square.y+vr.top][square.x+vr.left];
		cell.alive = !cell.alive
		this.updateNeighbors(square.x+vr.left, square.y+vr.top, this.bitmap, cell.alive)
		this.grid.drawCell(square.x, square.y, cell.alive);
		console.log(`Square(${square.x+vr.left}, ${square.y+vr.top}, n=${cell.neighbors})`);
	}

	setRunPauseButtonText(){
		let text = this.running? "Pause":"Run";
		this.runPause.innerHTML = text;
	}

	handleRandom = () => {
		this.bitmap = this.makeEmptyBitmap(true);
		this.grid.blankGrid();
		this.grid.updateChangedCells(this.getCells(this.bitmap));
	}

	handleRunPause = () => {
		console.log("run")
		let running = this.running;
		this.running = !running;
		this.setRunPauseButtonText();
		if (running) this.pause();
		else this.run();
	}

	run(){
		
		this.running = true;
		const calc0 = performance.now();
		let next = this.nextBitmap();
		this.bitmap = next.nextBitmap;
		const calc1 = performance.now();

		const rend0 = performance.now();
		this.grid.updateChangedCells(next.changes);
		const rend1 = performance.now();
		
		let time = {
			calc: Math.floor(calc1 - calc0),
			rend: Math.floor(rend1 - rend0)
		}

		console.log(time);

		this.timeoutHandler = window.setTimeout(()=>{
			this.run();
		}, this.delay);
	}

	pause(){
		this.running = false;
		window.clearTimeout(this.timeoutHandler);
		this.timeoutHandler = null;
	}

	makeEmptyBitmap(random){
		let bitmap = [];
		for(let y = 0; y < this.heightInCells; y++){
			bitmap[y] = [];
			for(let x = 0; x < this.widthInCells; x++){
				let alive = false;
				if (random) alive = Math.random() > 0.75;
				bitmap[y][x] = {
					alive: alive,
					neighbors: 0
				}
			}
		}
		if (random){
			for(let y = 0; y < this.heightInCells; y++){
				for(let x = 0; x < this.widthInCells; x++){
					bitmap[y][x].neighbors = this.countNeighbors(x, y, bitmap);
				}
			}
		}
		return bitmap;
	}

	countNeighbors(x, y, bitmap){
		let count = 0;
		for ( let i = y-1; i <= y+1; i ++){
			for ( let j = x-1; j <= x+1; j ++){
				if ( !((i == y) && (j == x)) ){
					if ( (j >= 0) && (j < bitmap[y].length) ){
						if ( (i >= 0) && (i < bitmap.length) ){
							count += bitmap[i][j].alive;
						}
					}
				}
			}
		}
		return count;
	}

	getCells(bitmap){
		let vr = this.getViewingRectangle();
		let cells = []
		
		for(let i = vr.top; i <= vr.bottom; i++){
			for(let j = vr.left; j <= vr.right; j++){
				if (i == this.heightInCells || j == this.widthInCells)break;
				if (bitmap[i][j].alive){
					cells[cells.length] = {
						x:j-vr.left,
						y:i-vr.top,
						alive:true
					};
				}
			}
		}
		return cells;
	}

	deepCopyBitmap(){
		let bitmapCopy = Array(this.heightInCells);
		for(let i = 0; i < this.heightInCells; i++){
			bitmapCopy[i] = Array(this.widthInCells);
			for(let j = 0; j < this.widthInCells; j++){
				let cell = this.bitmap[i][j];
				bitmapCopy[i][j] = {
					alive: cell.alive,
					neighbors: cell.neighbors
				}
			}
		}
		return bitmapCopy;
	}

	updateNeighbors(x, y, bitmap, alive){
		for ( let i = y-1; i <= y+1; i ++){
			for ( let j = x-1; j <= x+1; j ++){
				if ( !((i == y) && (j == x)) ){
					if ( (j >= 0) && (j < bitmap[y].length) ){
						if ( (i >= 0) && (i < bitmap.length) ){
							let incOrDec = alive? 1 : -1;
							bitmap[i][j].neighbors += incOrDec;
						}
					}
				}
			}
		}
	}

	cellIsInView(x, y){
		let vr = this.getViewingRectangle();
		return(
			x >= vr.left &&
			x <= vr.right &&
			y >= vr.top &&
			y <= vr.bottom
		);
	}

	nextBitmap(){
		let nextBitmap = this.deepCopyBitmap();
		let vr = this.getViewingRectangle();
		let changes = [];

		for (let y = 0; y < this.heightInCells; y ++){
			for(let x = 0; x < this.widthInCells; x++){
				let cell = this.bitmap[y][x];
				let change = {
					x: x - vr.left, 
					y: y -vr.top, 
					alive:!cell.alive
				}
				// Dead cell comes alive
				if (!cell.alive && cell.neighbors == 3){
					nextBitmap[y][x].alive = true;
					this.updateNeighbors(x, y, nextBitmap, true);
					if (this.cellIsInView(x, y)) changes[changes.length] = change;
				}
				// Live cell dies
				if (cell.alive && ![2,3].includes(cell.neighbors)){
					nextBitmap[y][x].alive = false;
					this.updateNeighbors(x, y, nextBitmap, false);
					if (this.cellIsInView(x, y)) changes[changes.length] = change;
				}
			}
		}
		
		console.log(this.getCells(nextBitmap).length);
		return {nextBitmap, changes};
	}
}

game = new Game(
	WIDTH_OF_CANVAS_IN_PIXELS,
	HEIGHT_OF_CANVAS_IN_PIXELS,
	WIDTH_OF_GAME_IN_CELLS,
	HEIGHT_OF_GAME_IN_CELLS,
	DEFAULT_CELL_SIZE,
	DEFAULT_ANIMATION_DELAY
);

