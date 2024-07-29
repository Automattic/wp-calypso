import { sortBy } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import LegendItem from 'calypso/components/legend-item';
import DataType from './data-type';

const NUM_COLOR_SECTIONS = 3;

export function sortData( data ) {
	return sortBy( data, ( datum ) => datum.value )
		.reverse()
		.map( ( datum, index ) => ( {
			...datum,
			sectionNum: index % ( data.length || NUM_COLOR_SECTIONS ),
		} ) );
}

class PieChartLegend extends Component {
	static propTypes = {
		data: PropTypes.arrayOf( DataType ).isRequired,
		onlyPercent: PropTypes.bool,
		fixedOrder: PropTypes.bool,
		svgElement: PropTypes.element,
	};

	state = {
		data: null,
		dataTotal: 0,
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( nextProps.data !== prevState.data ) {
			return {
				data: nextProps.data,
				dataTotal: nextProps.data.reduce( ( sum, { value } ) => sum + value, 0 ),
				transformedData: sortData( nextProps.data ),
			};
		}

		return null;
	}

	render() {
		const { transformedData, dataTotal } = this.state;

		const legendItems = this.props.fixedOrder ? this.props.data : transformedData;

		return (
			<div className="pie-chart__legend">
				{ legendItems.map( ( datum ) => {
					const percent =
						dataTotal > 0 ? Math.round( ( datum.value / dataTotal ) * 100 ).toString() : '0';

					return (
						<LegendItem
							key={ datum.name }
							name={ datum.name }
							value={ this.props.onlyPercent ? '' : datum.value.toString() }
							circleClassName={ `pie-chart__legend-sample-${ datum.sectionNum } pie-chart__legend-sample-${ datum.className }` }
							percent={ percent }
							description={ datum.description }
							svgElement={ this.props.svgElement }
						/>
					);
				} ) }
			</div>
		);
	}
}

export default PieChartLegend;
