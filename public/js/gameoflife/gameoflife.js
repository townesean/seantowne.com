class Square extends React.Component{
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
		var alive = this.props.lifeMatrix[y][x];

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
				>{running}</button>
				<button 
					onClick = {()=>this.props.onClearClick()}
				>Clear</button>
			</div>
		);
	}
}

class Game extends React.Component{
	constructor(props){
		super(props);

		var width = 90;
		var height = 54;

		var lifeMatrix = [];
		for (var i = 0; i < height; i++ ){
			var row = []
			for ( var j = 0; j < width; j++ ){
				row.push(Math.random() > 0.5);
			}
			lifeMatrix.push(row);
		}
		
		let colors = {
			aliveColor: "red",
			deadColor: "white",
		}

		this.state = {
			colors: colors,
			lifeMatrix: lifeMatrix,
			running: false,
		}
	}

	UNSAFE_componentWillMount(){
		
	}

	render(){
		return (
			<div id="game">
				<div id="board">
					<Board 
						colors = {this.state.colors}
						lifeMatrix = {this.state.lifeMatrix}
						onClick = {(x, y)=>this.handleSquareClick(x,y)}
					/>
				</div>

				<div id="controls">
					<Controls
						running = {this.state.running}
						onRunningPauseClick = {()=>this.handleRunningPauseClick()}
						onClearClick = {()=>this.handleClearClick()}
					/>
				</div>
			</div>
		);
			
	}

	countNeighbors(y, x, current){
		var count = 0;
		for ( let i = y-1; i <= y+1; i ++){
			for ( let j = x-1; j <= x+1; j ++){
				if ( !((i == y) && (j == x)) ){
					if ( (j >= 0) && (j < current[y].length) ){
						if ( (i >= 0) && (i < current.length) ){
							count += current[i][j];
						}
					}
				}
			}
		}
		return count;
	}

	nextMatrix(){
		console.log("nextMatrix");
		let current = this.state.lifeMatrix;
		let next = [];
		
		for (let i = 0; i < current.length; i ++){
			let nextRow = []
			for (let j = 0; j < current[i].length; j ++){
				let n_count = this.countNeighbors(i, j, current);
				let alive = current[i][j]
				
				if ( alive ){
					if ( n_count == 2 || n_count == 3 ) nextRow.push(true);
					else nextRow.push(false);
				}
				else if ( !alive ) {
					if (n_count == 3 ) nextRow.push(true);
					else nextRow.push(false);
				}
			}
			next.push(nextRow)
		}
		
		return next;
	}

	run(){
		//console.log("running");
		this.setState({ 
			lifeMatrix: this.nextMatrix()
		}, ()=>{
			if (this.state.running){
				setTimeout(()=>{this.run()}, 10);
			}
		});
	}
	pause(){
		console.log("paused");
	}

	handleRunningPauseClick(){
		let running = this.state.running;
		this.setState({ running: !running }, ()=>{
			if ( this.state.running ){
				this.run();
			} else {
				this.pause();
			}
		});
		
	}

	handleClearClick(){
		console.log("clear");
		this.setState({
			lifeMatrix: Array(this.state.lifeMatrix.length).fill(null).map(x => Array(this.state.lifeMatrix[0].length).fill(false)),
			running: false,
		})
	}

	handleSquareClick(x, y){
		let lifeMatrix = this.state.lifeMatrix;
		//console.log(this.countNeighbors(y, x, lifeMatrix))
		lifeMatrix[y][x] = !lifeMatrix[y][x];
		this.setState({
			lifeMatrix: lifeMatrix,
		}, ()=>{
			console.log(this.countNeighbors(y, x, this.state.lifeMatrix));
		});
	}
}

ReactDOM.render(
	<Game />,
	document.getElementById('gameoflife_react_component')
);