/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findIndex, noop } from 'lodash';

/**
 * Internal dependencies
 */
import LegendItem from 'components/legend-item';

const NUM_SERIES = 3;

class LineChartLegend extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		onDataSeriesSelected: PropTypes.func,
	};

	static defaultProps = {
		fillArea: false,
		onDataSeriesSelected: noop,
	};

	handleMouseOver = dataSeriesName => {
		const { data } = this.props;
		const index = findIndex( data, { name: dataSeriesName } );
		this.props.onDataSeriesSelected( index );
	};

	handleMouseOut = () => {
		this.props.onDataSeriesSelected( -1 );
	};

	render() {
		const { data } = this.props;

		return (
			<span className="line-chart__legend">
				{ data.map( ( dataSeries, index ) => {
					return (
						<LegendItem
							key={ dataSeries.name }
							name={ dataSeries.name }
							circleClassName={ `line-chart__legend-sample-${ index % NUM_SERIES }-fill` }
							description={ dataSeries.description }
							onMouseOver={ this.handleMouseOver }
							onMouseOut={ this.handleMouseOut }
						/>
					);
				} ) }
			</span>
		);
	}
}

export default LineChartLegend;
