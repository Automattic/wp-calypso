type PerformanceScoreProps = {
	score: number;
	size: number;
};

export default function PerformanceScore( { score, size }: PerformanceScoreProps ) {
	const getStatus = ( value: number ) => {
		if ( value <= 49 ) {
			return 'poor';
		} else if ( value > 49 && value < 90 ) {
			return 'needs-improvement';
		}
		return 'good';
	};

	return (
		<div className={ `circular-performance-bar ${ getStatus( score ) }` }>
			<div
				className={ `circular-performance-score ${
					size > 48 && 'circular-performance-score--large'
				} ` }
			>
				{ Math.floor( score ) }
			</div>
		</div>
	);
}
