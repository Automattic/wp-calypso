/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { min as d3Min, max as d3Max, extent as d3Extent } from 'd3-array';
import { line as d3Line } from 'd3-shape';
import { scaleLinear as d3ScaleLinear, scaleTime as d3TimeScale } from 'd3-scale';
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from 'd3-axis';
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
		aspectRatio: 2,
		margin: {
			top: 30,
			right: 30,
			bottom: 30,
			left: 30,
		},
	};

	drawLines = ( svg, params ) => {
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

	drawAxes = ( svg, params ) => {
		const { yScale, xTimeScale, height } = params;
		const { margin } = this.props;
		const axisLeft = d3AxisLeft( yScale );
		const bottomAxis = d3AxisBottom( xTimeScale );
		bottomAxis.ticks( 5 );
		svg
			.append( 'g' )
			.attr( 'transform', `translate(${ margin.left },0)` )
			.call( axisLeft );
		svg
			.append( 'g' )
			.attr( 'transform', `translate(0,${ height - margin.bottom })` )
			.call( bottomAxis );

		return svg;
	};

	drawChart = ( svg, params ) => {
		this.drawLines( svg, params );
		this.drawAxes( svg, params );
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
				.domain( [
					d3Min( concat( ...this.props.data ), d => d.value ) - 5,
					d3Max( concat( ...this.props.data ), d => d.value ) + 5,
				] )
				.range( [ newHeight - margin.bottom, margin.top ] ),
			xTimeScale: d3TimeScale()
				.domain( [
					this.props.data[ 0 ][ 0 ].date,
					this.props.data[ 0 ][ this.props.data[ 0 ].length - 1 ].date,
				] )
				.range( [ margin.left, newWidth - margin.right ] ),
		};
	};

	render() {
		return (
			<D3Base
				className={ 'line-chart' }
				drawChart={ this.drawChart }
				getParams={ this.getParams }
			/>
		);
	}
}

export default LineChart;
