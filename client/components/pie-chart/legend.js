import { sortBy } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import LegendItem from 'calypso/components/legend-item';
import DataType from './data-type';

const NUM_COLOR_SECTIONS = 3;

function transformData( data, regularOrder ) {
	const sortedData = sortBy( data, ( datum ) => datum.value );
	const orderedData = regularOrder ? sortedData.reverse() : sortedData;

	return orderedData.map( ( datum, index ) => {
		const sectionNum = regularOrder
			? index % NUM_COLOR_SECTIONS
			: ( orderedData.length - 1 - index ) % NUM_COLOR_SECTIONS; // Inverts colors when regularOrder is false
		return {
			...datum,
			sectionNum,
		};
	} );
}
class PieChartLegend extends Component {
	static propTypes = {
		data: PropTypes.arrayOf( DataType ).isRequired,
		onlyPercent: PropTypes.bool,
		regularOrder: PropTypes.bool,
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
				transformedData: transformData( nextProps.data, nextProps.regularOrder ),
			};
		}

		return null;
	}

	render() {
		const { transformedData, dataTotal } = this.state;

		return (
			<div className="pie-chart__legend">
				{ transformedData.map( ( datum ) => {
					const percent =
						dataTotal > 0 ? Math.round( ( datum.value / dataTotal ) * 100 ).toString() : '0';

					return (
						<LegendItem
							key={ datum.name }
							name={ datum.name }
							value={ this.props.onlyPercent ? '' : datum.value.toString() }
							circleClassName={ `pie-chart__legend-sample-${ datum.sectionNum }` }
							percent={ percent }
							description={ datum.description }
							regularOrder={ this.props.regularOrder }
						/>
					);
				} ) }
			</div>
		);
	}
}

export default PieChartLegend;
