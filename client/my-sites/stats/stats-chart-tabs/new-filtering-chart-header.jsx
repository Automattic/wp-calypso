import PropTypes from 'prop-types';
import Legend from 'calypso/components/chart/legend';

const NewFilteringChartHeader = ( {
	activeTab,
	activeLegend,
	availableLegend,
	onLegendClick,
	charts,
} ) => {
	return (
		<div className="stats-chart-tabs__header">
			{ /*ActiveTab Label Section */ }
			<div className="stats-chart-tabs__header-title">{ activeTab?.label }</div>

			{ /* Legend Section */ }
			<Legend
				activeCharts={ activeLegend }
				activeTab={ activeTab }
				availableCharts={ availableLegend }
				clickHandler={ onLegendClick }
				tabs={ charts }
			/>
		</div>
	);
};

NewFilteringChartHeader.propTypes = {
	activeTab: PropTypes.shape( {
		label: PropTypes.string,
		attr: PropTypes.string,
		gridicon: PropTypes.string,
		legendOptions: PropTypes.arrayOf( PropTypes.string ),
	} ),
	activeLegend: PropTypes.arrayOf( PropTypes.string ),
	availableLegend: PropTypes.arrayOf( PropTypes.string ),
	onLegendClick: PropTypes.func,
	charts: PropTypes.array,
};

export default NewFilteringChartHeader;
