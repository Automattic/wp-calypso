import { createSelector } from '@automattic/state-utils';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

import './style.scss';

const DEFAULT_HEIGHT = 20;

const FAKE_HOURLY_VIEWS_SEED = [ 1, 2, 3, 4, 3, 2, 1, 1, 1, 1, 1, 1 ];
const FAKE_HOURLY_PERIOD = 48;
const FAKE_HIGHEST_VIEWS = 10;

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

const StatsSparklineChartLoader = ( { className, height = DEFAULT_HEIGHT } ) => {
	const translate = useTranslate();
	const title = translate( 'Loading chart…' );

	let seed = [];
	while ( seed.length <= FAKE_HOURLY_PERIOD ) {
		seed = [ ...seed, ...FAKE_HOURLY_VIEWS_SEED ];
	}

	const [ offset, setOffset ] = useState( Math.floor( Math.random() * ( 8 - 1 + 1 ) + 1 ) );
	const [ fakeHourlyViews, setFakeHourlyViews ] = useState(
		seed.slice( offset, offset + FAKE_HOURLY_PERIOD )
	);

	useEffect( () => {
		const t = setTimeout( () => {
			setOffset( offset < 8 ? offset + 1 : 0 );
		}, 350 );
		return () => {
			clearTimeout( t );
		};
	}, [ offset ] );

	useEffect( () => {
		setFakeHourlyViews( seed.slice( offset, offset + FAKE_HOURLY_PERIOD ) );
	}, [ offset, setFakeHourlyViews ] );

	const chartHeight = height - 7; // remove the 5px + 2px = 7px total top+bottom padding
	const chartWidth = 2 * fakeHourlyViews.length - 1; // 1px bars with 1px space in between

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
				{ fakeHourlyViews.map( ( value, i ) => {
					// for zero value, we show a baseline bar with 1px height
					let lineHeight = 1;

					// if the chart is all zeros, show just the flat baseline
					if ( FAKE_HIGHEST_VIEWS > 0 ) {
						// fill the remaining height with the bar scaled according to the value
						lineHeight += ( value / FAKE_HIGHEST_VIEWS ) * ( chartHeight - 1 );
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
