import PropTypes from 'prop-types';
import Legend from 'calypso/components/chart/legend';

const ChartHeader = ( {
	children,
	showLegend,
	activeLegend,
	activeTab,
	availableLegend,
	onLegendClick,
	charts,
} ) => {
	return (
		<div className="stats-chart-tabs__header">
			{ children }
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
	children: PropTypes.node,
	showLegend: PropTypes.bool,
	activeLegend: PropTypes.arrayOf( PropTypes.string ),
	activeTab: PropTypes.object,
	availableLegend: PropTypes.arrayOf( PropTypes.string ),
	onLegendClick: PropTypes.func,
	charts: PropTypes.array,
};

export default ChartHeader;
