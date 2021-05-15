/*
class Square extends React.Component{
	
	shouldComponentUpdate(nextProps, nextState) {
		
		return ( this.props.alive != nextProps.alive )
	}
	
	render(){
		//if (Math.random() > 0.9) console.log("renderSquare")
		const color = (
			this.props.alive ? 
			this.props.colors.aliveColor : 
			this.props.colors.deadColor
		);
		return (
			<button
				className="square"
				onClick={this.props.onClick}
				style={{ backgroundColor: color }}
			>
			</button>
		);
	}
}
class Board extends React.Component{
	renderSquare(x, y){
		
		var alive = this.props.lifeMatrix[y][x].alive;
		var key = `( ${x} , ${y} )`;
		return(
			<Square
				key={key}
				alive={alive}
				onClick={()=>this.props.onClick(x, y)}
				colors={this.props.colors}
			>
			</Square>
		);
	}
	makeBoard(){
	}
	render(){
		const t = performance.now();
		const bh = this.props.lifeMatrix.length;
		const bw = this.props.lifeMatrix[0].length;
		let board = [];
		for ( let i = 0; i < bh; i ++){
			let row = [];
			for ( let j = 0; j < bw; j ++){
				row.push(this.renderSquare(j, i));
			}
			var key = "row: " + i.toString()
			board.push(<div key={key} className="board-row">{row}</div>);
		}
		const t0 = performance.now();
		console.log(`Board Render: ${t0-t}`);
		return(
			<div>
				{board}
			</div>
		);
	}
}
class Controls extends React.Component{
	render(){
		let pauseRun = this.props.running ? 'Pause' : 'Run';
		return(
			<div>
				<button 
					onClick = {()=>this.props.onRunningPauseClick()}
					>{pauseRun}
				</button>
				<button 
					onClick = {()=>this.props.onClearClick()}
					>Clear
				</button>
				<div id="slider">
					<input 
						type="range" 
						min="1" 
						max="100"
						step="1"
						onMouseUp={(event)=>this.props.onSpeedChange(event)}
						>
					</input>
				</div>
			</div>
		);
	}
}
class Game extends React.Component{
	constructor(props){
		super(props);
		
		this.width = 90;
		this.height = 54;
		var lifeMatrix = this.lifeMatrix(true);
		
		
		this.state = {
			colors: {
				aliveColor: #90c482,
				deadColor: "white",
			},
			lifeMatrix: lifeMatrix,
			running: false,
		}
	}
	render(){
		
		return (
			<div id="gol-game">
				<div id="gol-board">
					<Board 
						colors = {this.state.colors}
						lifeMatrix = {this.state.lifeMatrix}
						onClick = {(x,y)=>this.handleSquareClick(x,y)}
					/>
				</div>
				<div id="gol-controls">
					<Controls
						running = {this.state.running}
						onRunningPauseClick = {()=>this.handleRunningPauseClick()}
						onClearClick = {()=>this.handleClearClick()}
						onSpeedChange = {(event)=>this.handleSpeedChange(event)}
					/>
				</div>
			</div>
		);	
	}
	increment_decrement_Neighbors(y, x, matrix, incrementOrDecrement){
		var count = 0;
		for ( let i = y-1; i <= y+1; i ++){
			for ( let j = x-1; j <= x+1; j ++){
				if ( !((i == y) && (j == x)) ){
					if ( (j >= 0) && (j < matrix[y].length) ){
						if ( (i >= 0) && (i < matrix.length) ){
							var incOrDec = incrementOrDecrement? 1 : -1;
							matrix[i][j].neighborCount += incOrDec;
						}
					}
				}
			}
		}
	}
	lifeMatrix(random){
		var lifeMatrix = [];
		for (var i = 0; i < this.height; i++ ){
			var row = []
			for ( var j = 0; j < this.width; j++ ){
				let alive = false;
				if(random) alive = Math.random() > 0.7;
				let neighborCount = 0;
				row.push({
					alive: alive,
					neighborCount: neighborCount
				});
			}
			lifeMatrix.push(row);
		}
		for (var i = 0; i < this.height; i++ ){
			for ( var j = 0; j < this.width; j++ ){
				lifeMatrix[i][j].neighborCount = this.countNeighbors(i, j, lifeMatrix);
			}
		}
		return lifeMatrix;
	}
	delay = 1000;
	percentDelay = 0.5;
	handleSpeedChange(event){
		let percentDelay = event.target.value * 0.01;
		//console.log(`Delay changed to ${this.delay*percentDelay}`);
		this.percentDelay = percentDelay;
		if (this.state.running){
			clearInterval(this.interval);
			this.run();
		}
	}
	countNeighbors(y, x, current){
		var count = 0;
		for ( let i = y-1; i <= y+1; i ++){
			for ( let j = x-1; j <= x+1; j ++){
				if ( !((i == y) && (j == x)) ){
					if ( (j >= 0) && (j < current[y].length) ){
						if ( (i >= 0) && (i < current.length) ){
							count += current[i][j].alive;
						}
					}
				}
			}
		}
		return count;
	}
	deepCopyLifeMatrix(original){
		let copy = new Array(original.length);
		for (var i = 0; i < original.length; i ++){
			let nextRow = new Array(original[0].length);
			copy[i] = nextRow;
			for (var j = 0; j < original[0].length; j ++){
				let cell = original[i][j];
				copy[i][j] = {alive:cell.alive, neighborCount:cell.neighborCount}
			}
		}
		return copy;
	}
	nextMatrix(){
		//console.log("nextMatrix");
		let current = this.state.lifeMatrix;
		const t0 = performance.now();
		let next = this.deepCopyLifeMatrix(current);
		const t1 = performance.now();
		//console.log(`Copy Matrix: ${t1-t0}`);
		
		const t00 = performance.now();
		for (let i = 0; i < current.length; i ++){
			for (let j = 0; j < current[i].length; j ++){
				let cell = current[i][j];
				let nc = cell.neighborCount;
				
				
				// Cell is alive and becomes dead (Change)
				if ( cell.alive && ![2, 3].includes(nc) ){
					next[i][j].alive = false;
					this.increment_decrement_Neighbors(i, j, next, false);
					continue;
				}
				// Cell is dead and becomes alive (Change)
				if ( !cell.alive && (nc == 3) ) {
					next[i][j].alive = true;
					this.increment_decrement_Neighbors(i, j, next, true);
					continue;
				}
			}
		}
		const t01 = performance.now();
		//console.log(`New State: ${t01-t00}`);
		
		return next;
	}
	interval = null;
	run(){
		this.setState({running: true});
		this.interval = setInterval(() => {
			const t = performance.now();
			this.setState({
				lifeMatrix: this.nextMatrix()
			});
			const t1 = performance.now();
			console.log(`TOTAL Render time: ${t1-t}`);
		}, this.delay * this.percentDelay);
		//console.log("run clicked");
	}
	pause(){
		clearInterval(this.interval);
		this.setState({running:false});
		//console.log("paused clicked");
	}
	handleRunningPauseClick(){
		//console.log("Run/Pause clicked")
		let running = this.state.running;
		if (running){
			this.pause();
		}else{
			this.run();
		}
	}
	handleClearClick(){
		//console.log("clear clicked");
		this.pause();
		//let blank = Array(this.state.lifeMatrix.length).fill(null).map(x => Array(this.state.lifeMatrix[0].length).fill({alive:false, neighborCount:0}));
		this.setState({lifeMatrix: this.lifeMatrix()});
	}
	handleSquareClick = (x, y) => {
		let lifeMatrix = this.state.lifeMatrix;
		let neighbors = lifeMatrix[y][x].neighborCount;
		console.log(`Square(${x},${y}) clicked, ${neighbors} neighbors`)
		lifeMatrix[y][x].alive = !lifeMatrix[y][x].alive;
		this.increment_decrement_Neighbors(y, x, lifeMatrix, lifeMatrix[y][x].alive);
		this.setState({lifeMatrix: lifeMatrix});
	};
}
*/

class WorldWindow extends React.Component{
	constructor(props){
		super(props);
	}

	componentDidUpdate(){
		this.draw();
	}

	componentDidMount(){
		this.refs.canvas.getContext("2d").scale(2,2);
		this.draw();
	}

	
	drawCell(x, y, ctx, color){
		let l = this.props.cellSize;
		ctx.beginPath();
		ctx.lineWidth = 0.05;
		ctx.rect(x*l, y*l, l, l);
		ctx.outline = "white";
		ctx.fillStyle = color;
		ctx.fill();
		ctx.stroke();
	}

	draw(){
		const t = performance.now();
    	const ctx = this.refs.canvas.getContext("2d");
  
    	let cells = this.props.cells;
    	let cellsIndex = 0;
    	let cellsLength = cells.length;

    	let h = this.refs.canvas.height / this.props.cellSize;
    	let w = this.refs.canvas.width / this.props.cellSize;

    	for (let y = 0; y < h; y++){
    		for (let x = 0; x < w; x++){
    			let color = "white";
    			if ( cellsIndex < cellsLength ){
    				let cell = cells[cellsIndex];
    				if (cell[0] == x && cell[1] == y){
    					color = "#90c482";
    					cellsIndex++;
    				}
    			}
    			this.drawCell(x, y, ctx, color);
    		}
    	}
		const t1 = performance.now();
	}

	handleClick(event){
		this.props.onSquareClick(event, this.refs.canvas);
	}

	render(){
		
		let w = this.props.windowWidthInCells * this.props.standardCellSize;
		let h = this.props.windowHeightInCells * this.props.standardCellSize;
		
		return(
			<div id="gol-World">
				<canvas 
					ref="canvas" 
					width={2*w} 
					height={2*h}
					onClick = {(event)=>this.handleClick(event)}
					onWheel = {(event)=>this.props.onScroll(event)}
					style={{width:w, height:h}}
				/>
			</div>
		);
	}
}

class Controls extends React.Component{

	render(){
		let runPause = this.props.running? "Pause":"Run";
		return (
			<div id="gol-Controls">
				<button
					onClick = {()=>this.props.onPlayPauseClick()}
				>{runPause}</button>

				<button
					onClick = {()=>this.props.onClearClick()}
				>Clear</button>

				<button
					onClick = {()=>this.props.onRandom()}
				>Random</button>

				<input 
						className="slider"
						id="speed-slider"
						type="range" 
						min="10" 
						max="500"
						step="1"
						defaultValue={this.props.delay}
						onMouseUp={(event)=>this.props.onSpeedChange(event)}
						>
				</input>
			</div>
		);
	}
}

class Game extends React.Component{
	constructor(props){
		super(props);

		
		this.windowWidthInCells = 60;
		this.windowHeightInCells = 30;
		this.standardCellSize = 15;
		//this.cellWidthInPixels = 15
		//this.cellHeightInPixels = 15
		
	

		this.bitmap = this.makeEmptyBitmap(true);
		this.state = {
			cells: this.getCells(),
			running: false,
			delay: 100,
			cellSize: 15,
		}
	}

	makeEmptyBitmap(random){
		let bitmap = [];
		let h = 150;
		let w = 300;

		//for(let y = 0; y < this.windowHeightInCells; y++){
		for(let y = 0; y < h; y++){
			bitmap[y] = [];
			//for(let x = 0; x < this.windowWidthInCells; x++){
			for(let x = 0; x < w; x++){
				let alive = false;
				if (random) alive = Math.random() > 0.8;
				bitmap[y][x] = {
					alive: alive,
					neighbors: 0
				}
			}
		}
		if (random){
			for(let y = 0; y < h; y++){
				for(let x = 0; x < w; x++){
					bitmap[y][x].neighbors = this.countNeighbors(x, y, bitmap);
				}
			}
		}
		return bitmap;
	}

	getCells(){
		let cells = []
		for(let i = 0; i < this.bitmap.length; i++){
			for(let j = 0; j < this.bitmap[0].length; j++){
				if (this.bitmap[i][j].alive){
					cells[cells.length] = [j, i];
				}
			}
		}
		return cells;
	}

	deepCopyBitmap(){
		let h = 150;
		let w = 300;

		let bitmapCopy = Array(h);
		for(let i = 0; i < h; i++){
			bitmapCopy[i] = Array(w);
			for(let j = 0; j < w; j++){
				let cell = this.bitmap[i][j];
				bitmapCopy[i][j] = {
					alive: cell.alive,
					neighbors: cell.neighbors
				}
			}
		}
		return bitmapCopy;
	}

	nextBitmap(){
		let h = 150;
		let w = 300;
		let nextBitmap = this.deepCopyBitmap();
		for (let y=0; y < h; y ++){
			for(let x=0; x < w; x++){
				let cell = this.bitmap[y][x];
				// Dead cell comes alive
				if (!cell.alive && cell.neighbors == 3){
					nextBitmap[y][x].alive = true;
					this.updateNeighbors(x, y, nextBitmap, true);
				}
				// Live cell dies
				if (cell.alive && ![2,3].includes(cell.neighbors)){
					nextBitmap[y][x].alive = false;
					this.updateNeighbors(x, y, nextBitmap, false);
				}
			}
		}
		return nextBitmap;
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

	play(){
		this.setState({running: true});
		this.run();
	}
	run(){

		const t0 = performance.now();
		this.bitmap = this.nextBitmap();
		const t1 = performance.now();
		console.log(`Bitmap: ${t1-t0}`);

		const t2 = performance.now();
		let cells = this.getCells();
		const t3 = performance.now();
		console.log(`getCells: ${t3-t2}`);

		const t4 = performance.now();
		this.setState({ cells: cells });
		const t5 = performance.now();
		console.log(`setState: ${t5-t4}`);

		console.log(`Total Render Time = ${t5-t0}`);

		this.timeoutHandler = window.setTimeout(() => {
			this.run();
		}, this.state.delay);
	}

	pause(){
		window.clearTimeout(this.timeoutHandler);
		this.setState({running: false});
		this.timeoutHandler = null;
	}

	handlePlayPauseClick(){
		console.log("run-pause clicked");
		if (this.state.running) this.pause();
		else this.play();
	}

	handleSquareClick(event, canvas){
		const rect = canvas.getBoundingClientRect()
		let x = event.clientX - rect.left
    	let y = event.clientY - rect.top
    	x = Math.floor(x/this.state.cellSize);
    	y = Math.floor(y/this.state.cellSize);
    	this.bitmap[y][x].alive = !this.bitmap[y][x].alive;
    	this.updateNeighbors(x, y, this.bitmap, this.bitmap[y][x].alive)
    	console.log(`Square(${x}, ${y}, n=${this.bitmap[y][x].neighbors})`);
    	this.setState({cells: this.getCells()});
	}

	handleClearClick(){
		console.log("clear");
		//clearInterval(this.interval);
		window.clearTimeout(this.timeoutHandler);
		this.bitmap = this.makeEmptyBitmap(false);
		this.setState({
			cells: this.getCells(),
			running: false
		});
	}

	handleSpeedChange(event){
		this.setState({delay:event.target.value});
		/*
		if (this.state.running){
			window.clearTimeout(this.timeoutHandler);
			this.run();
		}
		*/
	}

	handleRandomClick(){
		this.bitmap = this.makeEmptyBitmap(true);
		this.setState({cells:this.getCells()});
	}

	handleScroll(event){
		//console.log(event.deltaY);
		let out = event.deltaY > 0;
		if (out){
			if (this.state.cellSize <= 1)return;
			this.setState({cellSize:this.state.cellSize-1})
		}else{
			if (this.state.cellSize >= 50)return;
			this.setState({cellSize:this.state.cellSize+1})
		}
	}

	render(){
		return(
			<div id="gol-Game">
				<WorldWindow
					cells = {this.state.cells}
					windowWidthInCells = {this.windowWidthInCells}
					windowHeightInCells = {this.windowHeightInCells}
					cellSize = {this.state.cellSize}
					standardCellSize = {this.standardCellSize}
					onSquareClick = {(event, canvas)=>this.handleSquareClick(event, canvas)}
					onScroll = {(event)=>this.handleScroll(event)}
				/>
				<Controls
					running = {this.state.running}
					onPlayPauseClick = {()=>this.handlePlayPauseClick()}
					onClearClick = {()=>this.handleClearClick()}
					onSpeedChange = {(event)=>this.handleSpeedChange(event)}
					onRandom = {()=>this.handleRandomClick()}
					delay = {this.state.delay}

				/>
			</div>
		);
	}
}

ReactDOM.render(
	<Game />,
	document.getElementById('gameoflife_react_component')
);