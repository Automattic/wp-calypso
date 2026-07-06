import { createSelector } from '@automattic/state-utils';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

const CHART_HEIGHT = 24;
const BAR_WIDTH = 2;
const BAR_GAP = 1;
const PEAK_MARKER_HEIGHT = 18;

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
	// The SVG's own box is just the bars (tight, no reserved space), so the
	// item's resting size is unaffected by the peak marker. The marker is
	// drawn below that box (y > CHART_HEIGHT) and only escapes clipping via
	// "overflow: visible" on hover, the same show/hide-on-hover technique
	// wp-admin's own admin bar sparkline uses for its width.
	const backdropWidth = chartWidth + 24 + String( highestViews ).length * 8;

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
			<g className="masterbar__stats-sparkline-peak">
				<rect
					className="masterbar__stats-sparkline-backdrop"
					x={ 0 }
					y={ CHART_HEIGHT }
					width={ backdropWidth }
					height={ PEAK_MARKER_HEIGHT }
				/>
				<line
					className="masterbar__stats-sparkline-baseline"
					x1={ 0 }
					y1={ CHART_HEIGHT }
					x2={ chartWidth }
					y2={ CHART_HEIGHT }
				/>
				<line
					className="masterbar__stats-sparkline-tick"
					x1={ chartWidth }
					y1={ CHART_HEIGHT }
					x2={ chartWidth }
					y2={ CHART_HEIGHT + 10 }
				/>
				<polygon
					className="masterbar__stats-sparkline-arrow"
					points={ `${ chartWidth + 6 },${ CHART_HEIGHT + 6 } ${ chartWidth + 6 },${
						CHART_HEIGHT + 14
					} ${ chartWidth },${ CHART_HEIGHT + 10 }` }
				/>
				<text
					className="masterbar__stats-sparkline-label"
					x={ chartWidth + 8 }
					y={ CHART_HEIGHT + 14 }
				>
					{ highestViews }
				</text>
			</g>
		</svg>
	);
}
