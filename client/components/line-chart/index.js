/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { extent as d3Extent } from 'd3-array';
import { line as d3Line } from 'd3-shape';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { concat } from 'lodash';

/**
 * Internal dependencies
 */
import D3Base from 'components/d3-base';

class LineChart extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		margin: PropTypes.object,
		aspectRatio: PropTypes.number,
	};

	static defaultProps = {
		aspectRatio: 4.5,
		margin: {
			top: 4,
			right: 4,
			bottom: 4,
			left: 4,
		},
	};

	drawLine = ( svg, params ) => {
		const { xScale, yScale } = params;
		const line = d3Line()
			.x( ( datum, index ) => xScale( index ) )
			.y( datum => yScale( datum.value ) );

		this.props.data.forEach( ( dataSeries, index ) => {
			const colorNum = index % 3;
			svg
				.append( 'path' )
				.attr( 'class', `line-chart__line-${ colorNum }` )
				.attr( 'd', line( dataSeries ) );
		} );

		return svg;
	};

	drawChart = ( svg, params ) => {
		this.drawLine( svg, params );
	};

	getParams = node => {
		const { aspectRatio, margin } = this.props;
		const newWidth = node.offsetWidth;
		const newHeight = newWidth / aspectRatio;
		return {
			height: newHeight,
			width: newWidth,
			xScale: d3ScaleLinear()
				.domain( d3Extent( this.props.data[ 0 ], ( d, i ) => i ) )
				.range( [ margin.left, newWidth - margin.right ] ),
			yScale: d3ScaleLinear()
				.domain( d3Extent( concat( ...this.props.data ), d => d.value ) )
				.range( [ newHeight - margin.bottom, margin.top ] ),
		};
	};

	render() {
		return <D3Base drawChart={ this.drawChart } getParams={ this.getParams } />;
	}
}

export default LineChart;
