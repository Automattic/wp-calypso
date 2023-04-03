import { translate } from 'i18n-calypso';
import { useState } from 'react';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import Chart from 'calypso/components/chart';
import Legend from 'calypso/components/chart/legend';
import { buildChartData } from 'calypso/my-sites/stats/stats-chart-tabs/utility';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import useVisitsQuery from './hooks/use-visits-query';

import './main.scss';

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

const Main = ( { siteId, quantity = 7 } ) => {
	const queryDate = '2023-03-31'; //TODO get site date
	const [ period, setPeriod ] = useState( 'day' );

	const { isLoading, data } = useVisitsQuery( siteId, period, quantity, queryDate );

	const barClick = () => {};

	const chartData = buildChartData(
		CHART_VIEWS.legendOptions,
		CHART_VIEWS.attr,
		data,
		period,
		queryDate
	);

	return (
		<div id="stats-widget-content" className="stats-widget-content">
			<div className="stats-widget__chart-head">
				<Intervals selected={ period } compact={ false } onChange={ setPeriod } />
				<Legend
					// What's the difference between these two props?
					availableCharts={ [ 'visitors' ] }
					activeCharts={ [ 'visitors' ] }
					tabs={ CHARTS }
					activeTab={ CHART_VIEWS }
					clickHandler={ null }
				/>
			</div>
			{ ( isLoading || ! ( chartData?.length > 0 ) ) && (
				<StatsModulePlaceholder className="is-chart" isLoading={ true } />
			) }
			{ chartData?.length > 0 && (
				<Chart barClick={ barClick } data={ chartData } minBarWidth={ 35 } />
			) }
		</div>
	);
};

export default Main;
