/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { extent as d3Extent } from 'd3-array';
import { line as d3Line, area as d3Area, curveMonotoneX as d3MonotoneXCurve } from 'd3-shape';
import { scaleLinear as d3ScaleLinear, scaleTime as d3TimeScale } from 'd3-scale';
import { axisBottom as d3AxisBottom, axisRight as d3AxisRight } from 'd3-axis';
import { select as d3Select } from 'd3-selection';
import { concat, first, last, mean } from 'lodash';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import D3Base from 'components/d3-base';
import Tooltip from 'components/tooltip';
import LineChartLegend from './legend';

const CHART_MARGIN = 0.01;
const POINTS_MAX = 10;
const POINTS_SIZE = 3;
const POINTS_END_SIZE = 1;
const X_AXIS_TICKS_MAX = 8;
const X_AXIS_TICKS_SPACE = 70;
const Y_AXIS_TICKS = 6;
const Y_AXIS_TICKS_SPACE = 30;
const APPROXIMATELY_A_MONTH_IN_MS = 31 * 24 * 60 * 60 * 1000;

const dateFormatFunction = displayMonthTicksOnly => ( date, index, tickRefs ) => {
	const everyOtherTickOnly = ! displayMonthTicksOnly && tickRefs.length > X_AXIS_TICKS_MAX;
	// this can only be figured out here, becuase D3 will decide how many ticks there should be
	const isFirstMonthTick =
		index ===
		Math.round(
			mean(
				tickRefs
					.map(
						( tickRef, tickRefIndex ) =>
							tickRef.__data__.getMonth() === date.getMonth() ? tickRefIndex : null
					)
					.filter( e => e !== null )
			)
		);
	return ( ! everyOtherTickOnly && ! displayMonthTicksOnly ) ||
		( everyOtherTickOnly && index % 2 === 0 ) ||
		( displayMonthTicksOnly && isFirstMonthTick )
		? moment( date ).format( displayMonthTicksOnly ? 'MMM' : 'MMM D' )
		: '';
};

const dateToAbsoluteMonth = date => date.getYear() * 12 + date.getMonth();
// number of different colors this component can display
// More than NUM_SERIES and 2 series will use the same color
const NUM_SERIES = 3;

class LineChart extends Component {
	static propTypes = {
		aspectRatio: PropTypes.number,
		data: PropTypes.array.isRequired,
		fillArea: PropTypes.bool,
		legendInfo: PropTypes.array,
		margin: PropTypes.object,
		renderTooltipForDatanum: PropTypes.func,
		shouldFadeIn: PropTypes.boolean,
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
		shouldFadeIn: false,
	};

	state = {
		data: null,
		fillArea: false,
		pointHovered: null,
		svg: null,
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( prevState.data !== nextProps.data ) {
			return { data: nextProps.data };
		}

		// force refresh D3Base if fillArea has changed
		if ( prevState.fillArea !== nextProps.fillArea ) {
			return {
				data: [ ...nextProps.data ],
				fillArea: nextProps.fillArea,
			};
		}

		return null;
	}

	drawAxes = ( svg, params ) => {
		this.drawXAxis( svg, params );
		this.drawYAxis( svg, params );
	};

	drawXAxis = ( svg, params ) => {
		const { displayMonthOnly, height, xScale, xTicks } = params;
		const { margin } = this.props;

		const axis = d3AxisBottom( xScale );
		axis.ticks( xTicks );
		axis.tickFormat( dateFormatFunction( displayMonthOnly ) );
		axis.tickSizeOuter( 0 );

		svg
			.append( 'g' )
			.attr( 'class', 'line-chart__x-axis' )
			.attr( 'transform', `translate(0,${ height - margin.bottom })` )
			.call( axis );
	};

	drawYAxis = ( svg, params ) => {
		const { yScale, yTicks, width } = params;
		const { margin } = this.props;

		const axis = d3AxisRight( yScale );
		axis.ticks( yTicks );
		axis.tickSize( width - margin.left - margin.right );
		axis.tickSizeOuter( 0 );

		const g = svg
			.append( 'g' )
			.attr( 'class', 'line-chart__y-axis' )
			.attr( 'transform', `translate(${ margin.left },0)` )
			.call( axis );

		// Removes the vertical axis line
		g.select( '.domain' ).remove();

		// Moves axis values below the tick lines, and right-align them
		g.selectAll( '.tick text' )
			.style( 'text-anchor', 'end' )
			.attr( 'transform', 'translate(-10,12)' );
	};

	drawLines = ( svg, params ) => {
		const { xScale, yScale } = params;
		const { data } = this.state;

		const line = d3Line()
			.x( datum => xScale( datum.date ) )
			.y( datum => yScale( datum.value ) )
			.curve( d3MonotoneXCurve );

		data.forEach( ( dataSeries, index ) => {
			const colorNum = index % NUM_SERIES;

			svg
				.append( 'path' )
				.attr( 'class', `line-chart__line-color-${ colorNum } line-chart__line-${ index }` )
				.attr( 'd', line( dataSeries ) );
		} );

		if ( this.state.fillArea ) {
			const area = d3Area()
				.x( datum => xScale( datum.date ) )
				.y0( yScale( 0 ) )
				.y1( datum => yScale( datum.value ) )
				.curve( d3MonotoneXCurve );

			data.forEach( ( dataSeries, index ) => {
				const colorNum = index % NUM_SERIES;

				svg
					.append( 'path' )
					.attr( 'class', `line-chart__area-color-${ colorNum } line-chart__area-${ index }` )
					.attr( 'd', area( dataSeries ) );
			} );
		}
	};

	drawPoints = ( svg, params ) => {
		const { xScale, yScale } = params;
		const { data } = this.state;

		data.forEach( ( dataSeries, dataSeriesIndex ) => {
			const drawFullSeries = dataSeries.length < POINTS_MAX;
			const colorNum = dataSeriesIndex % NUM_SERIES;

			( drawFullSeries ? dataSeries : [ first( dataSeries ), last( dataSeries ) ] ).forEach(
				datum => {
					svg
						.append( 'circle' )
						.attr(
							'class',
							`line-chart__line-point line-chart__line${
								drawFullSeries ? '' : '-end'
							}-point-color-${ colorNum }`
						)
						.attr( 'cx', xScale( datum.date ) )
						.attr( 'cy', yScale( datum.value ) )
						.attr( 'r', drawFullSeries ? POINTS_SIZE : POINTS_END_SIZE )
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
		this.drawAxes( svg, params );
		this.drawLines( svg, params );
		this.drawPoints( svg, params );
		this.bindEvents( svg, params );
		this.setState( { svg } );
	};

	handleMouseEnterPoint = point => {
		d3Select( point ).attr( 'r', Math.floor( POINTS_SIZE * 1.5 ) );

		this.setState( { pointHovered: point } );
	};

	handleMouseOutPoint = point => {
		d3Select( point ).attr( 'r', POINTS_SIZE );

		this.setState( { pointHovered: null } );
	};

	getXAxisParams = ( concatData, data, margin, newWidth ) => {
		const [ minTimestamp, maxTimestamp ] = d3Extent( concatData, datum => datum.date );

		const timeDomainAdjustment = ( maxTimestamp - minTimestamp ) * CHART_MARGIN;
		const displayMonthOnly = maxTimestamp - minTimestamp > APPROXIMATELY_A_MONTH_IN_MS;
		const months =
			dateToAbsoluteMonth( new Date( maxTimestamp ) ) -
			dateToAbsoluteMonth( new Date( minTimestamp ) );

		// start out with a single ticks for each data point, or the number of months if we have enough dates
		let xTicks = displayMonthOnly ? months : concatData.length / data.length;

		// reduce the number of ticks if it looks like they will be drawn too close together
		xTicks =
			Math.floor( newWidth / X_AXIS_TICKS_SPACE ) < xTicks
				? Math.floor( newWidth / X_AXIS_TICKS_SPACE )
				: xTicks;

		// if we still have more ticks that the maximum we allow, cut it down to the max
		xTicks = X_AXIS_TICKS_MAX < xTicks ? X_AXIS_TICKS_MAX : xTicks;

		return {
			xScale: d3TimeScale()
				.domain( [ minTimestamp - timeDomainAdjustment, maxTimestamp + timeDomainAdjustment ] )
				.range( [ margin.left, newWidth - margin.right - Y_AXIS_TICKS_SPACE ] ),
			xTicks,
			displayMonthOnly,
		};
	};

	getYAxisParams = ( concatData, margin, newHeight ) => {
		const [ minValue, maxValue ] = d3Extent( concatData, datum => datum.value );

		let maxDomain = maxValue;

		// Makes sure we always use integers instead of decimal numbers for tick labels when the maximum value is less
		// than the default number of ticks
		if ( maxDomain < Y_AXIS_TICKS ) {
			maxDomain = Y_AXIS_TICKS;
		}

		const valueDomainAdjustment = ( maxValue - minValue ) * CHART_MARGIN;

		maxDomain = maxDomain + valueDomainAdjustment;

		return {
			yScale: d3ScaleLinear()
				.domain( [ 0, maxDomain ] )
				.range( [ newHeight - margin.bottom, margin.top ] )
				.nice(),
			yTicks: Y_AXIS_TICKS,
		};
	};

	handleDataSeriesSelected = selectedItemIndex => {
		const { data } = this.props;
		const { svg } = this.state;

		if ( ! svg ) {
			return;
		}

		data.forEach( ( dataSeries, dataSeriesIndex ) => {
			const selected = selectedItemIndex === dataSeriesIndex;
			svg
				.select(
					`path.line-chart__line-${ dataSeriesIndex }, path.line-chart__area-${ dataSeriesIndex }`
				)
				.classed( 'line-chart__line-selected', selected );
		} );
	};

	getParams = node => {
		const { data } = this.state;
		const { aspectRatio, margin } = this.props;

		const newWidth = node.offsetWidth;
		const newHeight = newWidth / aspectRatio;

		const concatData = concat( ...data );

		return {
			height: newHeight,
			width: newWidth,
			...this.getXAxisParams( concatData, data, margin, newWidth ),
			...this.getYAxisParams( concatData, margin, newHeight ),
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
		const { legendInfo, shouldFadeIn } = this.props;
		const { data, pointHovered } = this.state;

		if ( ! data ) {
			return null;
		}

		const classes = [ 'line-chart' ];
		if ( shouldFadeIn ) {
			classes.push( 'line-chat__with-fade-in' );
		}

		return (
			<div className={ classnames( ...classes ) }>
				{ legendInfo && (
					<LineChartLegend
						data={ legendInfo }
						onDataSeriesSelected={ this.handleDataSeriesSelected }
					/>
				) }

				<D3Base
					className={ shouldFadeIn ? 'line-chart__base-with-fade-in' : 'line-chart__base' }
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
