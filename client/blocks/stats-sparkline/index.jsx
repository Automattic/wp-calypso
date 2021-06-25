/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const DEFAULT_HEIGHT = 20;

const StatsSparklineChart = ( { className, hourlyViews, height = DEFAULT_HEIGHT } ) => {
	const translate = useTranslate();
	const highestViews = Math.max( ...hourlyViews );
	const title = translate( 'Highest hourly views %(highestViews)s', { args: { highestViews } } );

	const chartHeight = height - 7; // remove the 5px + 2px = 7px total top+bottom padding
	const chartWidth = 2 * hourlyViews.length - 1; // 1px bars with 1px space in between

	return (
		<div
			className={ classnames( 'stats-sparkline', className ) }
			title={ title }
			style={ { height: chartHeight + 'px', width: chartWidth + 'px' } }
		>
			<svg
				width={ chartWidth }
				height={ chartHeight }
				viewBox={ `0 0 ${ chartWidth } ${ chartHeight }` }
			>
				{ hourlyViews.map( ( value, i ) => {
					// for zero value, we show a baseline bar with 1px height
					let lineHeight = 1;

					// if the chart is all zeros, show just the flat baseline
					if ( highestViews > 0 ) {
						// fill the remaining height with the bar scaled according to the value
						lineHeight += ( value / highestViews ) * ( chartHeight - 1 );
					}

					return (
						<rect
							x={ i * 2 }
							y={ chartHeight - lineHeight }
							height={ lineHeight }
							width={ 1 }
							key={ i }
							className="stats-sparkline__bar"
						/>
					);
				} ) }
			</svg>
		</div>
	);
};
const StatsSparkline = ( { className, siteId } ) => {
	const hourlyViews = useSelector( ( state ) => {
		const statsInsights = getSiteStatsNormalizedData( state, siteId, 'statsInsights' );
		return statsInsights.hourlyViews ? Object.values( statsInsights.hourlyViews ) : null;
	} );

	return (
		<>
			<QuerySiteStats siteId={ siteId } statType="statsInsights" />
			{ hourlyViews && <StatsSparklineChart className={ className } hourlyViews={ hourlyViews } /> }
		</>
	);
};

StatsSparkline.propTypes = {
	className: PropTypes.string,
	siteId: PropTypes.number,
};

export default StatsSparkline;
