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
		fillArea: PropTypes.bool,
	};

	static defaultProps = {
		fillArea: false,
	};

	render() {
		const { data, fillArea } = this.props;

		return (
			<div className="line-chart__legend">
				{ data.map( ( dataSeries, index ) => {
					return (
						<LegendItem
							key={ dataSeries.name }
							name={ dataSeries.name }
							circleClassName={ `line-chart__legend-sample-${ index % NUM_SERIES }${ fillArea &&
								'-fill' }` }
							description={ dataSeries.description }
						/>
					);
				} ) }
			</div>
		);
	}
}

export default LineChartLegend;
