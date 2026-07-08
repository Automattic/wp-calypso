import './style.scss';

const CHART_HEIGHT = 20;
const BAR_WIDTH = 1;
const BAR_GAP = 1;
const PEAK_HEADROOM = 4;
const DATA_HEIGHT = CHART_HEIGHT - PEAK_HEADROOM;

export function StatsSparkline( { hourlyViews }: { hourlyViews: number[] } ) {
	if ( hourlyViews.length === 0 ) {
		return null;
	}

	const highestViews = Math.max( ...hourlyViews );
	const chartWidth = hourlyViews.length * ( BAR_WIDTH + BAR_GAP ) - BAR_GAP;
	const peakY = PEAK_HEADROOM;

	return (
		<svg
			className="wpcom-stats-sparkline"
			width={ chartWidth }
			height={ CHART_HEIGHT }
			viewBox={ `0 0 ${ chartWidth } ${ CHART_HEIGHT }` }
			aria-hidden="true"
			focusable="false"
		>
			{ hourlyViews.map( ( value, i ) => {
				let barHeight = 1;

				if ( highestViews > 0 ) {
					barHeight += ( value / highestViews ) * ( DATA_HEIGHT - 1 );
				}

				return (
					<rect
						key={ i }
						className="wpcom-stats-sparkline-bar"
						x={ i * ( BAR_WIDTH + BAR_GAP ) }
						y={ CHART_HEIGHT - barHeight }
						width={ BAR_WIDTH }
						height={ barHeight }
					/>
				);
			} ) }
			<g className="wpcom-stats-sparkline-peak">
				<polygon
					className="wpcom-stats-sparkline-arrow"
					points={ `${ chartWidth + 10 },${ peakY - 3 } ${ chartWidth + 10 },${ peakY + 3 } ${
						chartWidth + 4
					},${ peakY }` }
				/>
				<text className="wpcom-stats-sparkline-label" x={ chartWidth + 12 } y={ peakY + 3 }>
					{ highestViews }
				</text>
			</g>
		</svg>
	);
}
