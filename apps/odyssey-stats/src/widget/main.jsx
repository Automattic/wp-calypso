import { translate } from 'i18n-calypso';
import { useState } from 'react';
// import { useSelector } from 'react-redux';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import ChartTabs from 'calypso/my-sites/stats/stats-chart-tabs';

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

const Main = () => {
	const activeTab = CHART_VIEWS;
	const [ activeLegend, setActiveLegend ] = useState( activeTab.legendOptions || [] );

	const getAvailableLegend = () => {
		return activeTab.legendOptions || [];
	};

	// const blogId = useSelector( ( state ) => state.ui.selectedSiteId );
	// const site = useSelector( ( state ) => state.sites.items[ blogId ] );

	const barClick = () => {};

	return (
		<div id="stats-widget-content" className="stats-widget-content">
			<Intervals selected="day" pathTemplate="" compact={ false } />
			<ChartTabs
				activeTab={ CHART_VIEWS }
				activeLegend={ activeLegend }
				availableLegend={ getAvailableLegend() }
				onChangeLegend={ setActiveLegend }
				barClick={ barClick }
				charts={ CHARTS }
				queryDate="2023-03-31"
				period="day"
				chartTab={ CHART_VIEWS.attr }
			/>
		</div>
	);
};

export default Main;
