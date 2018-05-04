/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import LegendItem from 'components/legend-item';

const NUM_SERIES = 3;

class LineChartLegend extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
	};

	static defaultProps = {
		fillArea: false,
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
						/>
					);
				} ) }
			</span>
		);
	}
}

export default LineChartLegend;
