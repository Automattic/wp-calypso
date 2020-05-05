/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { sortBy, sumBy } from 'lodash';

/**
 * Internal dependencies
 */
import DataType from './data-type';
import LegendItem from 'components/legend-item';

const NUM_COLOR_SECTIONS = 3;

function transformData( data ) {
	return sortBy( data, ( datum ) => datum.value )
		.reverse()
		.map( ( datum, index ) => ( {
			...datum,
			sectionNum: index % NUM_COLOR_SECTIONS,
		} ) );
}

class PieChartLegend extends Component {
	static propTypes = {
		data: PropTypes.arrayOf( DataType ).isRequired,
	};

	state = {
		data: null,
		dataTotal: 0,
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( nextProps.data !== prevState.data ) {
			return {
				data: nextProps.data,
				dataTotal: sumBy( nextProps.data, ( datum ) => datum.value ),
				transformedData: transformData( nextProps.data ),
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
							value={ datum.value.toString() }
							circleClassName={ `pie-chart__legend-sample-${ datum.sectionNum }` }
							percent={ percent }
							description={ datum.description }
						/>
					);
				} ) }
			</div>
		);
	}
}

export default PieChartLegend;
