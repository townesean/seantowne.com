const ALIVE_COLOR = "#90c482";
const DEAD_COLOR = "white";
const WIDTH_OF_CANVAS_IN_PIXELS = 1800; // pixels
const HEIGHT_OF_CANVAS_IN_PIXELS = 900; // pixels
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
		this.ctx.scale(2,2);
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
		this.widthInCells = widthInCells;
		this.heightInCells = heightInCells;
		this.widthInPixels = widthInPixels;
		this.heightInPixels = heightInPixels;
		this.cellSize = cellSize;

		this.viewingRectangle = this.getViewingRectangle();

		this.bitmap = this.makeEmptyBitmap(true);
		this.grid = new Grid(widthInPixels, heightInPixels, cellSize, 'gol');
		this.grid.blankGrid();
		let cells = this.getCells(this.bitmap);
		this.grid.updateChangedCells(cells);
		
		//this.grid.addEventListener('click', this.handleCellClick);
		this.grid.addEventListener('wheel', this.handleWheel);
		this.grid.addEventListener('mousedown', this.handleMouseDown);
		this.grid.addEventListener('mouseup', this.handleMouseUp);
		this.grid.addEventListener('mousemove', this.handleMouseMove);
		document.addEventListener('keydown', this.handleKeyPress);

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
			w: this.widthInPixels/this.cellSize/2,
			h: this.heightInPixels/this.cellSize/2
		}
	}

	getViewingRectangle(){
		if (!this.viewingRectangle){
			return ({
				x: 0,
				y: 0,
				w: this.viewRecDim().w,
				h: this.viewRecDim().h
			});
		}
		else{
			return ({
				x:this.viewingRectangle.x,
				y:this.viewingRectangle.y,
				w:this.viewRecDim().w,
				h:this.viewRecDim().h
			});
		}
	}

	setViewingRectangle(vr){
		let minX = 0;
		let minY = 0;
		let maxX = this.widthInCells - this.viewRecDim().w 
		let maxY = this.heightInCells - this.viewRecDim().h;

		if (vr.x < maxX && vr.x > minX) this.viewingRectangle.x = vr.x;
		if (vr.y < maxY && vr.x > minX) this.viewingRectangle.y = vr.y;
		this.viewingRectangle.w = this.viewRecDim().w;
		this.viewingRectangle.h = this.viewRecDim().h;
		/*
		let valid = (
			vr.x < maxX && 
			vr.x > minX && 
			vr.y < maxY && 
			vr.x > minY
		);

		if (valid){
			this.viewingRectangle = {
				x: vr.x,
				y: vr.y,
				w: this.viewRecDim().w,
				h: this.viewRecDim().h
			}
			return true;
		}
		else{
			console.log("Invalid Viewing Rect");
			console.log(vr);
			return false;
		}
		*/
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
			this.shiftViewingRectangle(delta);
		}
	}

	shiftViewingRectangle(delta){
		let vr = this.getViewingRectangle();
		vr.x -= delta.x;
		vr.y -= delta.y;
		this.setViewingRectangle(vr);
		this.redrawGrid();
		/*
		if (this.setViewingRectangle(vr)){
			this.redrawGrid();
		}
		*/
	}

	redrawGrid(){
		this.grid.blankGrid();
		this.grid.updateChangedCells(this.getCells(this.bitmap));
	}

	handleWheel = (event) => {
		let out = event.deltaY > 0;
		if (out){
			if(this.cellSize == MIN_CELL_SIZE)return;
			let newSize = this.cellSize * 0.95;
			if (newSize < MIN_CELL_SIZE) newSize = MIN_CELL_SIZE;
			this.cellSize = newSize;
			this.grid.cellSize = newSize;
			this.redrawGrid();
		}
		else{
			let newSize = this.cellSize * 1.05;
			if(newSize > MAX_CELL_SIZE) newSize = MAX_CELL_SIZE;
			this.cellSize = newSize;
			this.grid.cellSize = newSize;
			this.redrawGrid();
		}
	}

	handleCellClick = (event) => {
		let square = this.grid.eventCoordinants(event);
		let vr = this.getViewingRectangle();
		let cell = this.bitmap[square.y+vr.y][square.x+vr.x];
		cell.alive = !cell.alive
		this.updateNeighbors(square.x+vr.x, square.y+vr.y, this.bitmap, cell.alive)
		this.grid.drawCell(square.x, square.y, cell.alive);
		console.log(`Square(${square.x}, ${square.y}, n=${cell.neighbors})`);
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
		let running = this.running;
		this.running = !running;
		this.setRunPauseButtonText();
		if (running) this.pause();
		else this.run();
	}

	run(){
		this.running = true;
		const t = performance.now();
		let next = this.nextBitmap();
		this.bitmap = next.nextBitmap;
		this.grid.updateChangedCells(next.changes);
		const t1 = performance.now();
		console.log(t1-t)

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
		/*
		for(let i = 0; i < this.heightInCells; i++){
			for(let j = 0; j < this.widthInCells; j++){
				if (bitmap[i][j].alive){
					cells[cells.length] = {
						x:j,
						y:i,
						alive:true
					};
				}
			}
		}
		*/
		//console.log(this.viewingRectangle);
		for(let i = vr.y; i < vr.y + vr.h; i++){
			//console.log("loop")
			for(let j = vr.x; j < vr.x + vr.w; j++){
				if (bitmap[i][j].alive){
					cells[cells.length] = {
						x:j-vr.x,
						y:i-vr.y,
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

	nextBitmap(){
		let nextBitmap = this.deepCopyBitmap();
		let changes = [];
		/*
		for (let y=0; y < this.heightInCells; y ++){
			for(let x=0; x < this.widthInCells; x++){
				let cell = this.bitmap[y][x];
				let change = {
					x:x, 
					y:y, 
					alive:!cell.alive
				}
				// Dead cell comes alive
				if (!cell.alive && cell.neighbors == 3){
					nextBitmap[y][x].alive = true;
					this.updateNeighbors(x, y, nextBitmap, true);
					changes[changes.length] = change;
				}
				// Live cell dies
				if (cell.alive && ![2,3].includes(cell.neighbors)){
					nextBitmap[y][x].alive = false;
					this.updateNeighbors(x, y, nextBitmap, false);
					changes[changes.length] = change;
				}
			}
		}
		*/
		let vr = this.getViewingRectangle();
		for (let y = vr.y; y < vr.y + vr.h; y ++){
			for(let x= vr.x; x < vr.x + vr.w; x++){
				let cell = this.bitmap[y][x];
				let change = {
					x:x-vr.x, 
					y:y-vr.y, 
					alive:!cell.alive
				}
				// Dead cell comes alive
				if (!cell.alive && cell.neighbors == 3){
					nextBitmap[y][x].alive = true;
					this.updateNeighbors(x, y, nextBitmap, true);
					changes[changes.length] = change;
				}
				// Live cell dies
				if (cell.alive && ![2,3].includes(cell.neighbors)){
					nextBitmap[y][x].alive = false;
					this.updateNeighbors(x, y, nextBitmap, false);
					changes[changes.length] = change;
				}
			}
		}
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

