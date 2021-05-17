const ALIVE_COLOR = "#90c482";
const DEAD_COLOR = "white";
const WIDTH_OF_CANVAS_IN_PIXELS = 1800;
const HEIGHT_OF_CANVAS_IN_PIXELS = 900;
const DEFAULT_CELL_SIZE = 10;
const MIN_CELL_SIZE = 3;
const MAX_CELL_SIZE = 50;

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
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 0.1;
		this.ctx.moveTo(x, 0);
		this.ctx.lineTo(x, this.canvas.height);
		this.ctx.stroke(); 
	}

	horizontalLine(y){
		this.ctx.beginPath();
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 0.1;
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
	constructor(width, height, cellSize){
		this.worldWidth = 300;
		this.worldHeight = 150;
		this.cellSize = cellSize;
		this.bitmap = this.makeEmptyBitmap(true);
		this.grid = new Grid(width, height, cellSize, 'gol');
		this.grid.blankGrid();
		let cells = this.getCells(this.bitmap);
		this.grid.updateChangedCells(cells);
		
		this.grid.addEventListener('click', this.handleCellClick);
		this.grid.addEventListener('wheel', this.handleWheel);

		this.delay = 60;
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

	handleWheel = (event) => {
		
		let out = event.deltaY > 0;
		if (out){
			if(this.cellSize == MIN_CELL_SIZE)return;
			let newSize = this.cellSize * 0.9;
			if (newSize < MIN_CELL_SIZE) newSize = MIN_CELL_SIZE;
			this.cellSize = newSize;
			this.grid.cellSize = newSize;
			this.grid.blankGrid();
			this.grid.updateChangedCells(this.getCells(this.bitmap));
		}
		else{
			let newSize = this.cellSize * 1.1;
			if(newSize > MAX_CELL_SIZE) newSize = MAX_CELL_SIZE;
			this.cellSize = newSize;
			this.grid.cellSize = newSize;
			this.grid.blankGrid();
			this.grid.updateChangedCells(this.getCells(this.bitmap));
		}
	}

	handleCellClick = (event) => {
		let square = this.grid.eventCoordinants(event);
		let cell = this.bitmap[square.y][square.x];
		cell.alive = !cell.alive
		this.updateNeighbors(square.x, square.y, this.bitmap, cell.alive)
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
		if (this.running){
			this.pause();
			this.setRunPauseButtonText();
		}
		else{
			this.run();
			this.setRunPauseButtonText();
		}
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
		for(let y = 0; y < this.worldHeight; y++){
			bitmap[y] = [];
			for(let x = 0; x < this.worldWidth; x++){
				let alive = false;
				if (random) alive = Math.random() > 0.75;
				bitmap[y][x] = {
					alive: alive,
					neighbors: 0
				}
			}
		}
		if (random){
			for(let y = 0; y < this.worldHeight; y++){
				for(let x = 0; x < this.worldWidth; x++){
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
		let cells = []
		for(let i = 0; i < this.worldHeight; i++){
			for(let j = 0; j < this.worldWidth; j++){
				if (bitmap[i][j].alive){
					cells[cells.length] = {
						x:j,
						y:i,
						alive:true
					};
				}
			}
		}
		return cells;
	}

	deepCopyBitmap(){
		let bitmapCopy = Array(this.worldHeight);
		for(let i = 0; i < this.worldHeight; i++){
			bitmapCopy[i] = Array(this.worldWidth);
			for(let j = 0; j < this.worldWidth; j++){
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
		for (let y=0; y < this.worldHeight; y ++){
			for(let x=0; x < this.worldWidth; x++){
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
		return {nextBitmap, changes};
	}
}

game = new Game(
	WIDTH_OF_CANVAS_IN_PIXELS,
	HEIGHT_OF_CANVAS_IN_PIXELS,
	DEFAULT_CELL_SIZE
);

