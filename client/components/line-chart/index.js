/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { extent as d3Extent } from 'd3-array';
import { line as d3Line, curveNatural as d3NaturalCurve } from 'd3-shape';
import { scaleLinear as d3ScaleLinear, scaleTime as d3TimeScale } from 'd3-scale';
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from 'd3-axis';
import { concat } from 'lodash';

/**
 * Internal dependencies
 */
import D3Base from 'components/d3-base';

const POINT_SIZE = 3;
const END_POINT_SIZE = 1;
const MAX_DRAW_POINTS_SIZE = 10;
const CHART_MARGIN = 0.05;

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
		const { yScale, xScale, height } = params;
		const { margin } = this.props;

		const axisLeft = d3AxisLeft( yScale );
		const bottomAxis = d3AxisBottom( xScale );
		bottomAxis.ticks( 6 );

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
			.x( datum => xScale( datum.date ) )
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
				if ( ! drawFullSeries && ( datumIndex === 0 || datumIndex === dataSeries.length - 1 ) ) {
					svg
						.append( 'circle' )
						.attr( 'class', `line-chart__line-end-point-${ colorNum }` )
						.attr( 'cx', xScale( datum.date ) )
						.attr( 'cy', yScale( datum.value ) )
						.attr( 'r', END_POINT_SIZE );
				} else if ( drawFullSeries ) {
					svg
						.append( 'circle' )
						.attr( 'class', `line-chart__line-point-${ colorNum }` )
						.attr( 'cx', xScale( datum.date ) )
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

		const concatData = concat( ...data );

		const timeExtent = d3Extent( concatData, d => d.date );
		const timeDomainAdjustment = ( timeExtent[ 1 ] - timeExtent[ 0 ] ) * CHART_MARGIN;
		const valueExtent = d3Extent( concatData, d => d.value );
		const valueDomainAdjustment = ( valueExtent[ 1 ] - valueExtent[ 0 ] ) * CHART_MARGIN;

		return {
			height: newHeight,
			width: newWidth,
			xScale: d3TimeScale()
				.domain( [
					timeExtent[ 0 ] - timeDomainAdjustment,
					timeExtent[ 1 ] + timeDomainAdjustment,
				] )
				.range( [ margin.left, newWidth - margin.right ] ),
			yScale: d3ScaleLinear()
				.domain( [
					valueExtent[ 0 ] - valueDomainAdjustment,
					valueExtent[ 1 ] + valueDomainAdjustment,
				] )
				.range( [ newHeight - margin.bottom, margin.top ] )
				.nice(),
		};
	};

	render() {
		const { data } = this.props;

		return (
			<D3Base
				className={ 'line-chart' }
				drawChart={ this.drawChart }
				getParams={ this.getParams }
				data={ data }
			/>
		);
	}
}

export default LineChart;
