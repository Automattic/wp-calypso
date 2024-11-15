import config from '@automattic/calypso-config';
import PropTypes from 'prop-types';
import Legend from 'calypso/components/chart/legend';
import IntervalDropdown from 'calypso/components/stats-interval-dropdown';
import useIntervals from '../hooks/use-intervals';

const ChartHeader = ( {
	siteId,
	slug,
	period,
	queryParams,
	activeTab,
	showLegend,
	activeLegend,
	availableLegend,
	onLegendClick,
	charts,
} ) => {
	const isNewDateFilteringEnabled = config.isEnabled( 'stats/new-date-filtering' );

	const intervals = useIntervals( siteId );

	const onGatedHandler = () => {
		// TODO: Implement gated handler
	};

	return (
		<div className="stats-chart-tabs__header">
			<div className="stats-chart-tabs__header-title">{ activeTab?.label }</div>
			{ showLegend && (
				<Legend
					activeCharts={ activeLegend }
					activeTab={ activeTab }
					availableCharts={ availableLegend }
					clickHandler={ onLegendClick }
					tabs={ charts }
				/>
			) }
			{ isNewDateFilteringEnabled && (
				<IntervalDropdown
					slug={ slug }
					period={ period }
					queryParams={ queryParams }
					intervals={ intervals }
					onGatedHandler={ onGatedHandler }
				/>
			) }
		</div>
	);
};

ChartHeader.propTypes = {
	activeTab: PropTypes.object,
	controls: PropTypes.node,
	showLegend: PropTypes.bool,
	activeLegend: PropTypes.arrayOf( PropTypes.string ),
	availableLegend: PropTypes.arrayOf( PropTypes.string ),
	onLegendClick: PropTypes.func,
	charts: PropTypes.array,
};

export default ChartHeader;
