

function Square(props){
	return(
		<button 
			className="square" 
			onClick={props.onClick}
		>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	

	renderSquare(i) {
		return (
			<Square 
				value={this.props.squares[i]} 
				onClick={()=> this.props.onClick(i)}
			/>
		);
	}

	render() {
			
		let board = [];
		let l = 3
		for (let i = 0; i < l; i  ++){
			let row = [];
			for (let j = 0; j < l; j ++){
				row.push(this.renderSquare( j + l * i ));
			}
			board.push(<div className="board-row">{row}</div>)
		}

		return (
			<div>
				{board}
			</div>
		);
	}
}

class Game extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			history: [
				{
					squares: Array(9).fill(null),
					lastMove: null,
				}
			],
			stepNumber: 0,
			xIsNext: true,
		};
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);

		const moves = history.map((step, move) => {
			const bold = this.state.stepNumber == move;
			const lastMove = step.lastMove;
			const desc = move ?
				'Go to move #' + move + ': ' + lastMove:
				'Go to game start';
			return (
				<li key={move}>
					<button onClick={() => this.jumpTo(move)}>
						
						{bold ? <b>{desc}</b> : desc}
						
					</button>
				</li>
			);
		});

		let status;
		if(winner){
			status = "Winner: " + winner;
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board 
						squares = {current.squares}
						onClick = {(i)=>this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}

	jumpTo(move){
		this.setState({
			stepNumber: move,
			xIsNext: (move % 2) === 0,
		});
	}

	handleClick(i){
		const history = this.state.history.slice(0, this.state.stepNumber+1);
		const current = history[history.length-1];
		const squares = current.squares.slice();

		if ( calculateWinner(squares) || squares[i] ){
			return;
		}
		const letter = (this.state.xIsNext ? 'X' : 'O');
		squares[i] = letter;
		const row = (3-Math.floor(i/3));
		const col = (i % 3) + 1;
		const lastMove = letter + "(" + col + ", " + row + ")";
		this.setState({
			history: history.concat([{
				squares: squares,
				lastMove: lastMove,
			}]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
		});
	}
}

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return squares[a];
		}
	}
	return null;
}

// ========================================

ReactDOM.render(
	<Game />,
	document.getElementById('ticktacktoe_react_component')
);
