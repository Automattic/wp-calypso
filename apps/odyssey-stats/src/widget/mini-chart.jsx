import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useState, useEffect, useRef } from 'react';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import Chart from 'calypso/components/chart';
import Legend from 'calypso/components/chart/legend';
import { rectIsEqual, rectIsZero } from 'calypso/lib/track-element-size';
import { buildChartData } from 'calypso/my-sites/stats/stats-chart-tabs/utility';
import StatsEmptyState from 'calypso/my-sites/stats/stats-empty-state';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import nothing from '../components/nothing';
import useVisitsQuery from '../hooks/use-visits-query';

import './mini-chart.scss';

const CHART_VIEWS = {
	attr: 'views',
	legendOptions: [ 'visitors' ],
	label: translate( 'Views', { context: 'noun' } ),
};

const CHART_VISITORS = {
	attr: 'visitors',
	label: translate( 'Visitors', { context: 'noun' } ),
};

const CHARTS = [ CHART_VIEWS, CHART_VISITORS ];

const MiniChart = ( { siteId, quantity = 7, gmtOffset, odysseyStatsBaseUrl } ) => {
	const queryDate = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );
	const [ period, setPeriod ] = useState( 'day' );

	const { isLoading, data } = useVisitsQuery( siteId, period, quantity, queryDate );

	const barClick = ( bar ) => {
		window.location.href = `${ odysseyStatsBaseUrl }#!/stats/${ period }/${ siteId }?startDate=${ bar.data.period }`;
	};

	const chartData = buildChartData(
		CHART_VIEWS.legendOptions,
		CHART_VIEWS.attr,
		data,
		period,
		queryDate
	);

	const chartWrapperRef = useRef( null );
	const lastRect = useRef( null );
	useEffect( () => {
		if ( ! chartWrapperRef?.current ) {
			return;
		}
		const observer = new ResizeObserver( () => {
			const rect = chartWrapperRef.current ? chartWrapperRef.current.getBoundingClientRect() : null;
			if ( ! rectIsEqual( lastRect.current, rect ) && ! rectIsZero( rect ) ) {
				lastRect.current = rect;
				// Trigger a resize event to force the chart to redraw.
				window?.dispatchEvent( new Event( 'resize' ) );
			}
		} );

		observer.observe( chartWrapperRef.current );

		return () => observer.disconnect();
	} );

	return (
		<div
			ref={ chartWrapperRef }
			id="stats-widget-minichart"
			className="stats-widget-minichart"
			aria-hidden="true"
		>
			<div className="stats-widget-minichart__chart-head">
				<Intervals selected={ period } compact={ false } onChange={ setPeriod } />
			</div>
			{ isLoading && <StatsModulePlaceholder className="is-chart" isLoading={ true } /> }
			{ ! isLoading && (
				<>
					<Chart barClick={ barClick } data={ chartData } minBarWidth={ 35 }>
						<StatsEmptyState
							infoText={ translate(
								'There was no data recorded during the selected time period.'
							) }
						/>
					</Chart>
					<Legend
						availableCharts={ [ 'visitors' ] }
						activeCharts={ [ 'visitors' ] }
						tabs={ CHARTS }
						activeTab={ CHART_VIEWS }
						clickHandler={ nothing }
					/>
				</>
			) }
		</div>
	);
};

export default MiniChart;
