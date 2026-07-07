import { createSelector } from '@automattic/state-utils';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

// Matches wp-admin's own admin bar sparkline
// (wp-includes/charts/admin-bar-hours-scale.php): 48 hourly bars at a 2px
// pitch come out to the same 95px width wp-admin's chart image displays at
// rest. wp-admin also leaves a margin above and below the bars — the
// server-rendered chart reserves its own inset within the image on top of
// the toolbar's own margin, so bars there never touch the item's edges —
// hence the 6px (not the item's literal 4px) margin here.
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

const getHourlyViews = createSelector(
	( state, siteId ) => {
		const statsInsights = getSiteStatsNormalizedData( state, siteId, 'statsInsights' );
		return statsInsights.hourlyViews ? Object.values( statsInsights.hourlyViews ) : null;
	},
	( state, siteId ) => getSiteStatsNormalizedData( state, siteId, 'statsInsights' )
);

/**
 * @param {{ siteId?: number }} props
 */
export default function MasterbarStatsSparkline( { siteId } ) {
	const hourlyViews = useSelector( ( state ) => getHourlyViews( state, siteId ) );

	return (
		<>
			<QuerySiteStats siteId={ siteId } statType="statsInsights" />
			{ hourlyViews && <MasterbarStatsSparklineChart hourlyViews={ hourlyViews } /> }
		</>
	);
}

function MasterbarStatsSparklineChart( { hourlyViews } ) {
	const highestViews = Math.max( ...hourlyViews );
	const chartWidth = hourlyViews.length * ( BAR_WIDTH + BAR_GAP ) - BAR_GAP;
	const peakY = PEAK_HEADROOM;

	return (
		<svg
			className="masterbar__stats-sparkline"
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
						className="masterbar__stats-sparkline-bar"
						x={ i * ( BAR_WIDTH + BAR_GAP ) }
						y={ CHART_HEIGHT - barHeight }
						width={ BAR_WIDTH }
						height={ barHeight }
					/>
				);
			} ) }
			{ /* Sits just past the bars, clipped by "overflow: hidden" on
			     .masterbar__stats-sparkline until hover switches it to
			     "overflow: visible" — same reveal technique wp-admin uses
			     (there, widening the image's clipped container). Anchored
			     to PEAK_HEADROOM (the tallest bar's top), not the chart's
			     vertical center, matching wp-admin's own positioning. */ }
			<g className="masterbar__stats-sparkline-peak">
				<polygon
					className="masterbar__stats-sparkline-arrow"
					points={ `${ chartWidth + 10 },${ peakY - 3 } ${ chartWidth + 10 },${ peakY + 3 } ${
						chartWidth + 4
					},${ peakY }` }
				/>
				<text className="masterbar__stats-sparkline-label" x={ chartWidth + 12 } y={ peakY + 3 }>
					{ highestViews }
				</text>
			</g>
		</svg>
	);
}
