function NpsScore( score: number ) {
	return (
		<label>
			<input type="radio" name="nps-score" value={ score } />
			{ score }
		</label>
	);
}

export function Nps() {
	const scores = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

	return (
		<form>
			<h1>How are we doing so far?</h1>
			<fieldset>
				<legend>
					On a scale from 0–10, how likely are you to recommend WordPress.com to a friend or
					colleague?
				</legend>
				<div className="nps-scale">
					<span className="label-left">Not likely</span>
					<div className="score-buttons">{ scores.map( ( score ) => NpsScore( score ) ) }</div>
					<span className="label-right">Definitely</span>
				</div>
			</fieldset>
			<button type="submit">Submit</button>
		</form>
	);
}

export default Nps;
