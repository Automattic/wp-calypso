import { createSelector } from '@automattic/state-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

import './style.scss';

const DEFAULT_HEIGHT = 20;

const FAKE_HOURLY_PERIOD = 48;
const FAKE_HIGHEST_VIEWS = 10;

const SparklineChart = ( {
	className,
	highestViews,
	hourlyViews,
	chartHeight,
	chartWidth,
	title,
} ) => {
	return (
		<div
			className={ clsx( 'stats-sparkline', className ) }
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

const StatsSparklineChart = ( { className, hourlyViews, height = DEFAULT_HEIGHT } ) => {
	const translate = useTranslate();
	const highestViews = Math.max( ...hourlyViews );
	const title = translate( 'Highest hourly views %(highestViews)s', { args: { highestViews } } );

	const chartHeight = height - 7; // remove the 5px + 2px = 7px total top+bottom padding
	const chartWidth = 2 * hourlyViews.length - 1; // 1px bars with 1px space in between

	return (
		<SparklineChart
			className={ className }
			title={ title }
			chartHeight={ chartHeight }
			chartWidth={ chartWidth }
			hourlyViews={ hourlyViews }
			highestViews={ highestViews }
		></SparklineChart>
	);
};

const generateFakeHourlyViews = () => {
	const hourlyViews = [];
	while ( hourlyViews.length < FAKE_HOURLY_PERIOD ) {
		hourlyViews.push( Math.floor( Math.random() * ( 2 - 1 + 1 ) + 1 ) );
	}
	return hourlyViews;
};

const StatsSparklineChartLoader = ( { className, height = DEFAULT_HEIGHT } ) => {
	const translate = useTranslate();
	const title = translate( 'Loading chart…' );

	const [ fakeHourlyViews, setFakeHourlyViews ] = useState( generateFakeHourlyViews() );

	useEffect( () => {
		const t = setInterval( () => {
			setFakeHourlyViews( generateFakeHourlyViews() );
		}, 250 );
		return () => {
			clearInterval( t );
		};
	}, [] );

	const chartHeight = height - 7; // remove the 5px + 2px = 7px total top+bottom padding
	const chartWidth = 2 * fakeHourlyViews.length - 1; // 1px bars with 1px space in between

	return (
		<SparklineChart
			className={ className }
			title={ title }
			chartHeight={ chartHeight }
			chartWidth={ chartWidth }
			hourlyViews={ fakeHourlyViews }
			highestViews={ FAKE_HIGHEST_VIEWS }
		></SparklineChart>
	);
};

const getStatsInsightsHourlyViews = createSelector(
	( state, siteId ) => {
		const statsInsights = getSiteStatsNormalizedData( state, siteId, 'statsInsights' );
		return statsInsights.hourlyViews ? Object.values( statsInsights.hourlyViews ) : null;
	},
	( state, siteId ) => getSiteStatsNormalizedData( state, siteId, 'statsInsights' )
);

const StatsSparkline = ( { className, showLoader = false, siteId } ) => {
	const hourlyViews = useSelector( ( state ) => getStatsInsightsHourlyViews( state, siteId ) );
	return (
		<>
			<QuerySiteStats siteId={ siteId } statType="statsInsights" />
			{ hourlyViews && <StatsSparklineChart className={ className } hourlyViews={ hourlyViews } /> }
			{ ! hourlyViews && showLoader && <StatsSparklineChartLoader className={ className } /> }
		</>
	);
};

StatsSparkline.propTypes = {
	className: PropTypes.string,
	siteId: PropTypes.number,
	showLoader: PropTypes.bool,
};

export default StatsSparkline;
