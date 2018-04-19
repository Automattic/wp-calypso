/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { min as d3Min, max as d3Max, extent as d3Extent } from 'd3-array';
import { line as d3Line, curveNatural as d3NaturalCurve } from 'd3-shape';
import { scaleLinear as d3ScaleLinear, scaleTime as d3TimeScale } from 'd3-scale';
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from 'd3-axis';
import { concat, first, last } from 'lodash';

/**
 * Internal dependencies
 */
import D3Base from 'components/d3-base';

const POINT_SIZE = 3;
const MAX_DRAW_POINTS_SIZE = 10;

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
	};

	drawLines = ( svg, params ) => {
		const { xScale, yScale } = params;
		const { data } = this.props;

		const line = d3Line()
			.x( ( datum, index ) => xScale( index ) )
			.y( datum => yScale( datum.value ) )
			.curve( d3NaturalCurve );

		data.forEach( ( dataSeries, index ) => {
			const colorNum = index % 3;

			svg
				.append( 'path' )
				.attr( 'class', `line-chart__line-${ colorNum }` )
				.attr( 'd', line( dataSeries ) );
		} );
	};

	drawPoints = ( svg, params ) => {
		const { xScale, yScale } = params;
		const { data } = this.props;

		data.forEach( ( dataSeries, dataSeriesIndex ) => {
			const drawFullSeries = dataSeries.length < MAX_DRAW_POINTS_SIZE;
			const colorNum = dataSeriesIndex % 3;
			dataSeries.forEach( ( datum, datumIndex ) => {
				if ( datumIndex === 0 || datumIndex === dataSeries.length - 1 ) {
					svg
						.append( 'circle' )
						.attr( 'class', `line-chart__line-end-point-${ colorNum }` )
						.attr( 'cx', xScale( datumIndex ) )
						.attr( 'cy', yScale( datum.value ) )
						.attr( 'r', POINT_SIZE );
				} else if ( drawFullSeries ) {
					svg
						.append( 'circle' )
						.attr( 'class', `line-chart__line-point-${ colorNum }` )
						.attr( 'cx', xScale( datumIndex ) )
						.attr( 'cy', yScale( datum.value ) )
						.attr( 'r', POINT_SIZE );
				}
			} );
		} );
	};

	drawChart = ( svg, params ) => {
		this.drawLines( svg, params );
		this.drawPoints( svg, params );
		this.drawAxes( svg, params );
	};

	getParams = node => {
		const { aspectRatio, margin, data } = this.props;
		const newWidth = node.offsetWidth;
		const newHeight = newWidth / aspectRatio;

		return {
			height: newHeight,
			width: newWidth,
			xScale: d3ScaleLinear()
				.domain( d3Extent( first( data ), ( d, i ) => i ) )
				.range( [ margin.left, newWidth - margin.right ] ),
			yScale: d3ScaleLinear()
				.domain( [
					d3Min( concat( ...data ), d => d.value ) - 5,
					d3Max( concat( ...data ), d => d.value ) + 5,
				] )
				.range( [ newHeight - margin.bottom, margin.top ] ),
			xTimeScale: d3TimeScale()
				.domain( [ first( first( data ) ).date, last( first( data ) ).date ] )
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
