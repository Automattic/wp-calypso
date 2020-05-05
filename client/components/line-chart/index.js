/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { extent as d3Extent } from 'd3-array';
import { line as d3Line, area as d3Area, curveMonotoneX as d3MonotoneXCurve } from 'd3-shape';
import { scaleLinear as d3ScaleLinear, scaleTime as d3TimeScale } from 'd3-scale';
import { axisBottom as d3AxisBottom, axisRight as d3AxisRight } from 'd3-axis';
import { select as d3Select, mouse as d3Mouse } from 'd3-selection';
import { concat, first, last, mean, throttle, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import D3Base from 'components/d3-base';
import Tooltip from 'components/tooltip';
import { withLocalizedMoment } from 'components/localized-moment';
import LineChartLegend from './legend';

/**
 * Style dependencies
 */
import './style.scss';

const CHART_MARGIN = 0.01;
const POINTS_MAX = 10;
const POINTS_SIZE = 3;
const POINT_HIGHLIGHT_SIZE_FACTOR = 1.5;
const POINTS_END_SIZE = 1;
const X_AXIS_TICKS_MAX = 8;
const X_AXIS_TICKS_SPACE = 70;
const Y_AXIS_TICKS = 6;
const Y_AXIS_TICKS_SPACE = 30;
const APPROXIMATELY_A_MONTH_IN_MS = 31 * 24 * 60 * 60 * 1000;

const dateToAbsoluteMonth = ( date ) => date.getYear() * 12 + date.getMonth();
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
		renderTooltipForDatanum: ( datum ) => datum.value,
	};

	state = {
		data: null,
		fillArea: false,
		selectedPoints: [],
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

	dateFormatFunction = ( displayMonthTicksOnly ) => ( date, index, tickRefs ) => {
		const everyOtherTickOnly = ! displayMonthTicksOnly && tickRefs.length > X_AXIS_TICKS_MAX;
		// this can only be figured out here, because D3 will decide how many ticks there should be
		const isFirstMonthTick =
			index ===
			Math.round(
				mean(
					tickRefs
						.map( ( tickRef, tickRefIndex ) =>
							tickRef.__data__.getMonth() === date.getMonth() ? tickRefIndex : null
						)
						.filter( ( e ) => e !== null )
				)
			);
		return ( ! everyOtherTickOnly && ! displayMonthTicksOnly ) ||
			( everyOtherTickOnly && index % 2 === 0 ) ||
			( displayMonthTicksOnly && isFirstMonthTick )
			? this.props.moment( date ).format( displayMonthTicksOnly ? 'MMM' : 'MMM D' )
			: '';
	};

	drawAxes = ( svg, params ) => {
		this.drawXAxis( svg, params );
		this.drawYAxis( svg, params );
	};

	drawXAxis = ( svg, params ) => {
		const { displayMonthOnly, height, xScale, xTicks } = params;
		const { margin } = this.props;

		const axis = d3AxisBottom( xScale );
		axis.ticks( xTicks );
		axis.tickFormat( this.dateFormatFunction( displayMonthOnly ) );
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
			.x( ( datum ) => xScale( datum.date ) )
			.y( ( datum ) => yScale( datum.value ) )
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
				.x( ( datum ) => xScale( datum.date ) )
				.y0( yScale( 0 ) )
				.y1( ( datum ) => yScale( datum.value ) )
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
				( datum ) => {
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
						.datum( { ...datum, dataSeriesIndex } );
				}
			);
		} );
	};

	bindEvents = ( svg, params ) => {
		const updateMouseMove = throttle( this.handleMouseMove, 100, { trailing: false } );
		svg.on( 'mousemove', function () {
			const coordinates = d3Mouse( this );
			updateMouseMove( ...coordinates, params );
		} );
		svg.on( 'mouseleave', () => {
			// remove rect, temporary points and tooltips
			svg.selectAll( `rect.line-chart__date-range-selected` ).remove();
			svg.selectAll( `circle.line-chart__line-point-hover` ).remove();
			this.setState( { selectedPoints: [] } );
			// reset point size
			svg.selectAll( `circle.line-chart__line-point` ).attr( 'r', POINTS_SIZE );
		} );
	};

	drawOverlayElement = ( svg ) => {
		// This is needed so we can bind mouse events on the whole svg
		// otherwise they will only be fired over svg shapes.
		// SVG2 could solve it with `pointer-events: bounding-box;`
		// but it's only supported in chrome at the moment.
		svg.attr( 'pointer-events', 'all' );
		svg
			.append( 'rect' )
			.attr( 'x', 0 )
			.attr( 'y', 0 )
			.attr( 'width', '100%' )
			.attr( 'height', '100%' )
			.attr( 'fill', 'none' );
	};

	drawChart = ( svg, params ) => {
		this.drawAxes( svg, params );
		this.drawLines( svg, params );
		this.drawPoints( svg, params );
		this.drawOverlayElement( svg, params );
		this.bindEvents( svg, params );
		this.setState( { svg } );
	};

	handleMouseMove = ( X, Y, params ) => {
		const { xScale, yScale } = params;
		const { svg, data } = this.state;

		const xDate = xScale.invert( X );
		let closestDate = 0,
			prevClosestDate = 0,
			nextClosestDate = 0;

		const firstDataSerie = data[ 0 ];
		const drawFullSeries = firstDataSerie.length < POINTS_MAX;
		// assume sorted by date
		firstDataSerie.forEach( ( datum, index ) => {
			if ( Math.abs( xDate - datum.date ) < Math.abs( xDate - closestDate ) ) {
				closestDate = datum.date;
				prevClosestDate = firstDataSerie[ index - 1 ]
					? firstDataSerie[ index - 1 ].date
					: datum.date;
				nextClosestDate = firstDataSerie[ index + 1 ]
					? firstDataSerie[ index + 1 ].date
					: datum.date;
			}
		} );

		const startDateBar = closestDate + Math.round( ( prevClosestDate - closestDate ) / 2 );
		const endDateBar = closestDate + Math.round( ( nextClosestDate - closestDate ) / 2 );

		const bar = svg.select( `rect.line-chart__date-range-${ closestDate }` );

		if ( bar.empty() ) {
			svg
				.select(
					`rect.line-chart__date-range-selected:not(.line-chart__date-range-${ closestDate })`
				)
				.remove();

			svg
				.append( 'rect' )
				.attr( 'class', `line-chart__date-range-selected line-chart__date-range-${ closestDate }` )
				.attr( 'x', xScale( startDateBar ) )
				.attr( 'y', 0 )
				.attr( 'width', xScale( endDateBar ) - xScale( startDateBar ) )
				.attr( 'height', yScale( 0 ) );

			svg.selectAll( `circle.line-chart__line-point` ).attr( 'r', POINTS_SIZE );

			if ( drawFullSeries ) {
				const selectedPoints = svg.selectAll(
					`circle.line-chart__line-point[cx="${ xScale( closestDate ) }"]`
				);
				selectedPoints.attr( 'r', Math.floor( POINTS_SIZE * POINT_HIGHLIGHT_SIZE_FACTOR ) );
				this.setState( { selectedPoints: selectedPoints.nodes() } );
			} else {
				svg.selectAll( 'circle.line-chart__line-point-hover' ).remove();
				let circles = [];
				data.forEach( ( dataSeries, dataSeriesIndex ) => {
					const colorNum = dataSeriesIndex % NUM_SERIES;

					dataSeries.forEach( ( datum ) => {
						if ( closestDate === datum.date ) {
							const circleSelection = svg
								.append( 'circle' )
								.attr(
									'class',
									`line-chart__line-point line-chart__line-point-hover line-chart__line-point-color-${ colorNum }`
								)
								.attr( 'cx', xScale( datum.date ) )
								.attr( 'cy', yScale( datum.value ) )
								.attr( 'r', Math.floor( POINTS_SIZE * POINT_HIGHLIGHT_SIZE_FACTOR ) )
								.datum( { ...datum, dataSeriesIndex } );
							circles = circles.concat( circleSelection.nodes() );
						}
					} );
				} );

				this.setState( { selectedPoints: circles } );
			}
		}
	};

	getXAxisParams = ( concatData, data, margin, newWidth ) => {
		const [ minTimestamp, maxTimestamp ] = d3Extent( concatData, ( datum ) => datum.date );

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
		const [ minValue, maxValue ] = d3Extent( concatData, ( datum ) => datum.value );

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

	handleDataSeriesSelected = ( selectedItemIndex ) => {
		const { data } = this.props;
		const { svg } = this.state;

		if ( ! svg ) {
			return;
		}

		// reset points
		svg.selectAll( `circle.line-chart__line-point` ).attr( 'r', POINTS_SIZE );

		this.setState( { selectedPoints: [] } );

		data.forEach( ( dataSeries, dataSeriesIndex ) => {
			const selected = selectedItemIndex === dataSeriesIndex;
			const lineSelection = svg.select( `path.line-chart__line-${ dataSeriesIndex }` );
			const areaSelection = svg.select( `path.line-chart__area-${ dataSeriesIndex }` );
			lineSelection.classed( 'line-chart__line-selected', selected );
			areaSelection.classed( 'line-chart__area-selected', selected );
			const fadeUnselected = selectedItemIndex >= 0 && ! selected;
			lineSelection.classed( 'line-chart__line-not-selected', fadeUnselected );
			areaSelection.classed( 'line-chart__area-not-selected', fadeUnselected );

			if ( selected ) {
				// bring to front
				lineSelection.each( function () {
					this.parentNode.appendChild( this );
				} );
				areaSelection.each( function () {
					this.parentNode.appendChild( this );
				} );
				const selectedPoints = svg.selectAll(
					`circle.line-chart__line-point-color-${ dataSeriesIndex }`
				);
				selectedPoints.attr( 'r', Math.floor( POINTS_SIZE * POINT_HIGHLIGHT_SIZE_FACTOR ) );
				this.setState( { selectedPoints: selectedPoints.nodes() } );
			}
		} );
	};

	getParams = ( node ) => {
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

	getTooltipPositionMap = ( values ) => {
		const sortedUniqValues = uniq( values ).sort(
			( leftValue, rightValue ) => leftValue - rightValue
		);

		switch ( sortedUniqValues.length ) {
			case 1:
				return {
					[ sortedUniqValues[ 0 ] ]: 'top',
				};
			case 2:
				return {
					[ sortedUniqValues[ 0 ] ]: 'bottom',
					[ sortedUniqValues[ 1 ] ]: 'top',
				};
			case 3:
				return {
					[ sortedUniqValues[ 0 ] ]: 'bottom',
					[ sortedUniqValues[ 1 ] ]: 'left',
					[ sortedUniqValues[ 2 ] ]: 'top',
				};
			default:
				return {
					[ sortedUniqValues[ 0 ] ]: 'bottom',
					[ sortedUniqValues[ 1 ] ]: 'left',
					[ sortedUniqValues[ 2 ] ]: 'right',
					[ sortedUniqValues[ 3 ] ]: 'top',
				};
		}
	};

	renderTooltips = () => {
		const { selectedPoints } = this.state;
		const selectPointsValues = selectedPoints.map( ( point ) => d3Select( point ).datum().value );
		const tooltipPositionsMap = this.getTooltipPositionMap( selectPointsValues );

		return selectedPoints.map( ( point ) => {
			const pointData = d3Select( point ).datum();

			if ( ! pointData ) {
				return null;
			}

			const uniqueKey = `tooltip-${ pointData.dataSeriesIndex }-${ pointData.date }`;

			return (
				<Tooltip
					className="line-chart__tooltip is-streak"
					context={ point }
					position={ tooltipPositionsMap[ pointData.value ] }
					key={ uniqueKey }
					isVisible
				>
					{ this.props.renderTooltipForDatanum( pointData ) }
				</Tooltip>
			);
		} );
	};

	render() {
		const { legendInfo } = this.props;
		const { data } = this.state;

		if ( ! data ) {
			return null;
		}

		return (
			<div className="line-chart">
				{ legendInfo && (
					<LineChartLegend
						data={ legendInfo }
						onDataSeriesSelected={ this.handleDataSeriesSelected }
					/>
				) }

				<D3Base
					className="line-chart__base"
					drawChart={ this.drawChart }
					getParams={ this.getParams }
					data={ data }
				/>

				{ this.renderTooltips() }
			</div>
		);
	}
}

export default withLocalizedMoment( LineChart );
