import PropTypes from 'prop-types';
import Legend from 'calypso/components/chart/legend';

const ChartHeader = ( {
	activeTab,
	showLegend,
	activeLegend,
	availableLegend,
	onLegendClick,
	charts,
} ) => {
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
