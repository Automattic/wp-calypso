import { createSelector } from '@automattic/state-utils';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

// Matches wp-admin's own admin bar sparkline (wp-includes/charts/admin-bar-hours-scale.php),
// whose <img> is 24px tall inside a 32px-tall toolbar item.
const CHART_HEIGHT = 24;
const BAR_WIDTH = 2;
const BAR_GAP = 1;

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
	const peakCenterY = CHART_HEIGHT / 2;

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
					barHeight += ( value / highestViews ) * ( CHART_HEIGHT - 1 );
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
			     (there, widening the image's clipped container). */ }
			<g className="masterbar__stats-sparkline-peak">
				<polygon
					className="masterbar__stats-sparkline-arrow"
					points={ `${ chartWidth + 10 },${ peakCenterY - 4 } ${ chartWidth + 10 },${
						peakCenterY + 4
					} ${ chartWidth + 4 },${ peakCenterY }` }
				/>
				<text
					className="masterbar__stats-sparkline-label"
					x={ chartWidth + 12 }
					y={ peakCenterY + 4 }
				>
					{ highestViews }
				</text>
			</g>
		</svg>
	);
}
