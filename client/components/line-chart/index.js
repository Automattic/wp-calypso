/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { extent as d3Extent } from 'd3-array';
import { line as d3Line, area as d3Area, curveMonotoneX as d3MonotoneXCurve } from 'd3-shape';
import { scaleLinear as d3ScaleLinear, scaleTime as d3TimeScale } from 'd3-scale';
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from 'd3-axis';
import { select as d3Select } from 'd3-selection';
import { concat, first, last } from 'lodash';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import D3Base from 'components/d3-base';
import Tooltip from 'components/tooltip';

const POINT_SIZE = 3;
const END_POINT_SIZE = 1;
const MAX_DRAW_POINTS_SIZE = 10;
const CHART_MARGIN = 0.01;
const MAX_LEFT_TICKS = 6;
const MAX_BOTTOM_TICKS = 8;
const SPACE_FOR_BOTTOM_TICK = 70;

const dateFormatFunction = displayMonthOnly => ( date, index, tickRefs ) => {
	const everyOtherTick = tickRefs.length > MAX_BOTTOM_TICKS;
	return ! everyOtherTick || index % 2 === 0
		? moment( date ).format( displayMonthOnly ? 'MMM' : 'MMM D' )
		: '';
};

class LineChart extends Component {
	static propTypes = {
		aspectRatio: PropTypes.number,
		data: PropTypes.array.isRequired,
		fillArea: PropTypes.bool,
		margin: PropTypes.object,
		renderTooltipForDatanum: PropTypes.func,
		yAxisMode: PropTypes.oneOf( [ 'relative', 'absolute' ] ),
	};

	static defaultProps = {
		aspectRatio: 2,
		fillArea: false,
		margin: {
			top: 30,
			right: 30,
			bottom: 30,
			left: 30,
		},
		renderTooltipForDatanum: datum => datum.value,
		yAxisMode: 'absolute',
	};

	state = {
		pointHovered: null,
	};

	drawAxes = ( svg, params ) => {
		this.drawBottomAxis( svg, params );
		this.drawLeftAxis( svg, params );
	};

	drawBottomAxis = ( svg, params ) => {
		const { bottomTicks, displayMonthOnly, height, xScale } = params;
		const { margin } = this.props;

		const axis = d3AxisBottom( xScale );
		axis.ticks( bottomTicks );
		axis.tickFormat( dateFormatFunction( displayMonthOnly ) );

		svg
			.append( 'g' )
			.attr( 'class', 'line-chart__x-axis' )
			.attr( 'transform', `translate(0,${ height - margin.bottom })` )
			.call( axis );
	};

	drawLeftAxis = ( svg, params ) => {
		const { leftTicks, yScale } = params;
		const { margin } = this.props;

		const axis = d3AxisLeft( yScale );
		axis.ticks( leftTicks );

		svg
			.append( 'g' )
			.attr( 'class', 'line-chart__y-axis' )
			.attr( 'transform', `translate(${ margin.left },0)` )
			.call( axis );
	};

	drawLines = ( svg, params ) => {
		const { xScale, yScale } = params;
		const { data } = this.props;

		const line = d3Line()
			.x( datum => xScale( datum.date ) )
			.y( datum => yScale( datum.value ) )
			.curve( d3MonotoneXCurve );

		data.forEach( ( dataSeries, index ) => {
			const colorNum = index % 3;

			svg
				.append( 'path' )
				.attr( 'class', `line-chart__line-${ colorNum }` )
				.attr( 'd', line( dataSeries ) );
		} );

		if ( this.props.fillArea ) {
			const area = d3Area()
				.x( datum => xScale( datum.date ) )
				.y0( yScale( 0 ) )
				.y1( datum => yScale( datum.value ) )
				.curve( d3MonotoneXCurve );

			data.forEach( ( dataSeries, index ) => {
				const colorNum = index % 3;

				svg
					.append( 'path' )
					.attr( 'class', `line-chart__area-${ colorNum }` )
					.attr( 'd', area( dataSeries ) );
			} );
		}
	};

	drawPoints = ( svg, params ) => {
		const { xScale, yScale } = params;
		const { data } = this.props;

		data.forEach( ( dataSeries, dataSeriesIndex ) => {
			const drawFullSeries = dataSeries.length < MAX_DRAW_POINTS_SIZE;
			const colorNum = dataSeriesIndex % 3;

			( drawFullSeries ? dataSeries : [ first( dataSeries ), last( dataSeries ) ] ).forEach(
				datum => {
					svg
						.append( 'circle' )
						.attr(
							'class',
							`line-chart__line-point line-chart__line${
								drawFullSeries ? '' : '-end'
							}-point-${ colorNum }`
						)
						.attr( 'cx', xScale( datum.date ) )
						.attr( 'cy', yScale( datum.value ) )
						.attr( 'r', drawFullSeries ? POINT_SIZE : END_POINT_SIZE )
						.datum( datum );
				}
			);
		} );
	};

	bindEvents = svg => {
		const self = this;

		svg
			.selectAll( 'circle' )
			.on( 'mouseenter', function( point, index ) {
				self.handleMouseEnterPoint( this, index );
			} )
			.on( 'mouseout', function( point, index ) {
				self.handleMouseOutPoint( this, index );
			} );
	};

	drawChart = ( svg, params ) => {
		this.drawLines( svg, params );
		this.drawPoints( svg, params );
		this.drawAxes( svg, params );
		this.bindEvents( svg, params );
	};

	handleMouseEnterPoint = point => {
		d3Select( point ).attr( 'r', Math.floor( POINT_SIZE * 1.5 ) );

		this.setState( { pointHovered: point } );
	};

	handleMouseOutPoint = point => {
		d3Select( point ).attr( 'r', POINT_SIZE );

		this.setState( { pointHovered: null } );
	};

	getParams = node => {
		const { aspectRatio, margin, data, yAxisMode } = this.props;
		const newWidth = node.offsetWidth;
		const newHeight = newWidth / aspectRatio;

		const concatData = concat( ...data );

		const timeExtent = d3Extent( concatData, d => d.date );
		const timeDomainAdjustment = ( timeExtent[ 1 ] - timeExtent[ 0 ] ) * CHART_MARGIN;
		const valueExtent = d3Extent( concatData, d => d.value );
		const valueDomainAdjustment = ( valueExtent[ 1 ] - valueExtent[ 0 ] ) * CHART_MARGIN;

		const minDate = new Date( timeExtent[ 0 ] );
		const maxDate = new Date( timeExtent[ 1 ] );
		const months = maxDate.getMonth() - minDate.getMonth() + 1;
		minDate.setMonth( minDate.getMonth() + 1 );
		// in case of a short month like Feb.
		maxDate.setDate( maxDate.getDate() - 3 );

		const displayMonthOnly = minDate < maxDate;

		// if the value is less than our max ticks, use that value so that each tick is a round integer
		const leftTicks = MAX_LEFT_TICKS > valueExtent[ 1 ] ? valueExtent[ 1 ] : MAX_LEFT_TICKS;

		// use only enough ticks for months, or the etire length of the data
		let bottomTicks = displayMonthOnly ? months : concatData.length / data.length;
		// reduce the number of ticks if it looks like they will be drawn too close together
		bottomTicks =
			Math.floor( newWidth / SPACE_FOR_BOTTOM_TICK ) < bottomTicks
				? Math.floor( newWidth / SPACE_FOR_BOTTOM_TICK )
				: bottomTicks;
		// if we still have more ticks that the maximum we allow, cut it down to the max
		bottomTicks = MAX_BOTTOM_TICKS < bottomTicks ? MAX_BOTTOM_TICKS : bottomTicks;

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
					yAxisMode === 'relative' ? valueExtent[ 0 ] - valueDomainAdjustment : 0,
					valueExtent[ 1 ] + valueDomainAdjustment,
				] )
				.range( [ newHeight - margin.bottom, margin.top ] )
				.nice(),
			leftTicks,
			bottomTicks,
			displayMonthOnly,
		};
	};

	getTooltipContent = () => {
		const { pointHovered } = this.state;

		if ( ! pointHovered ) {
			return null;
		}

		const circle = d3Select( pointHovered );
		const datum = circle.datum();

		return (
			<span className="line-chart__tooltip">{ this.props.renderTooltipForDatanum( datum ) }</span>
		);
	};

	render() {
		const { data } = this.props;
		const { pointHovered } = this.state;

		if ( ! data ) {
			return null;
		}

		return (
			<div>
				<D3Base
					className="line-chart__base"
					drawChart={ this.drawChart }
					getParams={ this.getParams }
					data={ data }
				/>

				<Tooltip
					className="line-chart__tooltip is-streak"
					id="popover__line-chart"
					context={ pointHovered }
					isVisible={ !! pointHovered }
					position="top"
				>
					{ this.getTooltipContent() }
				</Tooltip>
			</div>
		);
	}
}

export default LineChart;
