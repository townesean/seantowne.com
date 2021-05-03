


class Square extends React.Component{


	shouldComponentUpdate(nextProps, nextState) {
		
		return ( this.props.alive != nextProps.alive )
	}

	render(){
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

		var key = ("(" + x.toString() + ", " + y.toString() + ")");
		return(
			<Square
				key={key}
				alive={alive}
				onClick={()=> this.props.onClick(x, y)}
				colors={this.props.colors}
			>
			</Square>
		);
	}

		render(){
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

		return(
			<div>
				{board}
			</div>
		);
	}
}

class Controls extends React.Component{
	render(){
		let running = this.props.running ? 'Pause' : 'Run';
		return(
			<div>

				<button 
					onClick = {()=>this.props.onRunningPauseClick()}
					>{running}
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
				aliveColor: "#90c482",
				deadColor: "white",
			},
			lifeMatrix: lifeMatrix,
			running: false,
		}
	}

	UNSAFE_componentWillMount(){
		
	}

	render(){
		return (
			<div id="gol-game">
				<div id="gol-board">
					<Board 
						colors = {this.state.colors}
						lifeMatrix = {this.state.lifeMatrix}
						onClick = {(x, y)=>this.handleSquareClick(x,y)}
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
		console.log(`Delay changed to ${this.delay*percentDelay}`);
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
		console.log("nextMatrix");
		let current = this.state.lifeMatrix;
		const t0 = performance.now();
		let next = this.deepCopyLifeMatrix(current);
		const t1 = performance.now();
		console.log(`Copy Matrix: ${t1-t0}`);
		
		const t00 = performance.now();
		for (let i = 0; i < current.length; i ++){
			for (let j = 0; j < current[i].length; j ++){
				let cell = current[i][j];
				let nc = cell.neighborCount;

				/*
				// Cell is dead and stays dead (No Change)
				if(!cell.alive && (nc != 3) ) {
					continue;
				}
				
				// Cell is alive and stays alive (No Change)
				if ( cell.alive && [2, 3].includes(nc) ){
					continue;
				}
				*/
				
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
		console.log(`New State: ${t01-t00}`);
		
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
			console.log(`Render State: ${t1-t}`);
		}, this.delay * this.percentDelay);
		console.log("run clicked");
	}

	pause(){
		clearInterval(this.interval);
		this.setState({running:false});
		console.log("paused clicked");
	}

	handleRunningPauseClick(){
		console.log("Run/Pause clicked")
		let running = this.state.running;
		if (running){
			this.pause();
		}else{
			this.run();
		}
	}

	handleClearClick(){
		console.log("clear clicked");
		this.pause();
		//let blank = Array(this.state.lifeMatrix.length).fill(null).map(x => Array(this.state.lifeMatrix[0].length).fill({alive:false, neighborCount:0}));
		this.setState({lifeMatrix: this.lifeMatrix()});
	}

	handleSquareClick(x, y){
		let lifeMatrix = this.state.lifeMatrix;
		let neighbors = lifeMatrix[y][x].neighborCount;
		console.log(`Square(${x},${y}) clicked, ${neighbors} neighbors`)
		lifeMatrix[y][x].alive = !lifeMatrix[y][x].alive;
		this.increment_decrement_Neighbors(y, x, lifeMatrix, lifeMatrix[y][x].alive);
		this.setState({lifeMatrix: lifeMatrix});
	}
}

ReactDOM.render(
	<Game />,
	document.getElementById('gameoflife_react_component')
);