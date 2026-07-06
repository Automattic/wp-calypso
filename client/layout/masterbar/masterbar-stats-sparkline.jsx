import { createSelector } from '@automattic/state-utils';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

const CHART_HEIGHT = 22;
const LABEL_AREA_HEIGHT = 12;
const LABEL_AREA_WIDTH = 18;
const BAR_WIDTH = 1;
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
	// The bars sit below the reserved label area, so their baseline is at
	// LABEL_AREA_HEIGHT + CHART_HEIGHT and everything drawn stays within the
	// viewBox (no negative coordinates, which would get clipped by the
	// fixed-position masterbar rather than by the SVG itself).
	const baseline = LABEL_AREA_HEIGHT + CHART_HEIGHT;

	return (
		<svg
			className="masterbar__stats-sparkline"
			width={ chartWidth + LABEL_AREA_WIDTH }
			height={ baseline }
			viewBox={ `0 0 ${ chartWidth + LABEL_AREA_WIDTH } ${ baseline }` }
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
						y={ baseline - barHeight }
						width={ BAR_WIDTH }
						height={ barHeight }
					/>
				);
			} ) }
			<g className="masterbar__stats-sparkline-peak">
				<line
					className="masterbar__stats-sparkline-baseline"
					x1={ 0 }
					y1={ baseline }
					x2={ chartWidth }
					y2={ baseline }
				/>
				<line
					className="masterbar__stats-sparkline-tick"
					x1={ chartWidth }
					y1={ baseline }
					x2={ chartWidth }
					y2={ 2 }
				/>
				<polygon
					className="masterbar__stats-sparkline-arrow"
					points={ `${ chartWidth + 6 },2 ${ chartWidth + 6 },10 ${ chartWidth },6` }
				/>
				<text className="masterbar__stats-sparkline-label" x={ chartWidth + 8 } y={ 10 }>
					{ highestViews }
				</text>
			</g>
		</svg>
	);
}
