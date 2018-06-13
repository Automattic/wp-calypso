/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import LegendItem from 'components/legend-item';

const NUM_SERIES = 3;

class LineChartLegend extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		onDataSeriesSelected: PropTypes.func,
		shouldFadeIn: PropTypes.boolean,
	};

	static defaultProps = {
		fillArea: false,
		onDataSeriesSelected: noop,
		shouldFadeIn: false,
	};

	handleMouseOver = dataSeriesIndex => {
		this.props.onDataSeriesSelected( dataSeriesIndex );
	};

	handleMouseOut = () => {
		this.props.onDataSeriesSelected( -1 );
	};

	render() {
		const { data, shouldFadeIn } = this.props;

		return (
			<span className={ shouldFadeIn ? 'line-chart__legend-with-fade' : 'line-chart__legend' }>
				{ data.map( ( dataSeries, index ) => {
					return (
						// eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
						<LegendItem
							key={ dataSeries.name }
							name={ dataSeries.name }
							circleClassName={ `line-chart__legend-sample-${ index % NUM_SERIES }-fill` }
							description={ dataSeries.description }
							seriesIndex={ index }
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
