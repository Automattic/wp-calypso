import './stats-sparkline.scss';

// Matches wp-admin's own admin bar sparkline
// (wp-includes/charts/admin-bar-hours-scale.php): 48 hourly bars at a 2px
// pitch come out to the same 95px width wp-admin's chart image displays at
// rest, with a 6px effective top/bottom margin once centered in a 32px row.
const CHART_HEIGHT = 20;
const BAR_WIDTH = 1;
const BAR_GAP = 1;

// wp-admin's chart scales bars within chart_height - 10 (its own file's
// constant), reserving room above the tallest bar for the peak arrow +
// label, which it anchors to the *top of the tallest bar* — not the
// vertical center of the chart. Since our tallest bar always reaches
// exactly this reserved headroom by construction, the marker's Y is a
// fixed offset, not data-dependent to compute.
const PEAK_HEADROOM = 4;
const DATA_HEIGHT = CHART_HEIGHT - PEAK_HEADROOM;

/**
 * The "views over 48 hours" sparkline, matching wp-admin's own admin bar
 * sparkline in proportions and behavior: the peak-value marker (an arrow +
 * the highest hourly view count) is rendered past the bars and relies on
 * the host applying "overflow: hidden" on `.wpcom-stats-sparkline` at rest
 * and "overflow: visible" on hover/focus to reveal it — the same
 * show/hide-on-hover technique wp-admin uses for its own chart image.
 */
export function StatsSparkline( { hourlyViews }: { hourlyViews: number[] } ) {
	const highestViews = Math.max( ...hourlyViews );
	const chartWidth = hourlyViews.length * ( BAR_WIDTH + BAR_GAP ) - BAR_GAP;
	const peakY = PEAK_HEADROOM;

	return (
		<svg
			className="wpcom-stats-sparkline"
			width={ chartWidth }
			height={ CHART_HEIGHT }
			viewBox={ `0 0 ${ chartWidth } ${ CHART_HEIGHT }` }
		>
			{ hourlyViews.map( ( value, i ) => {
				// for zero value, show a baseline bar with 1px height
				let barHeight = 1;

				// if the chart is all zeros, show just the flat baseline
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
