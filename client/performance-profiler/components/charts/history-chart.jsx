import { Icon, info } from '@wordpress/icons';
import { extent as d3Extent, max as d3Max } from 'd3-array';
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from 'd3-axis';
import {
	scaleLinear as d3ScaleLinear,
	scaleTime as d3TimeScale,
	scaleThreshold as d3ScaleThreshold,
} from 'd3-scale';
import { select as d3Select, event as d3Event } from 'd3-selection';
import { line as d3Line, curveMonotoneX as d3MonotoneXCurve } from 'd3-shape';
import { timeFormat as d3TimeFormat } from 'd3-time-format';
import React, { createRef, useEffect } from 'react';
import './style.scss';

const MAX_TICKS = 4;

// Create scales for the chart
const createScales = ( data, range, margin, width, height ) => {
	const xScale = d3TimeScale()
		.domain( d3Extent( data, ( item ) => new Date( item.date ) ) )
		.range( [ margin.left + 20, width - margin.right - 20 ] );

	const yScale = d3ScaleLinear()
		.domain( [ 0, d3Max( data, ( item ) => item.value ) * 1.5 ] )
		.nice()
		.range( [ height - margin.bottom, margin.top ] );

	const colorScale = d3ScaleThreshold()
		.domain( range )
		.range( [ '#00BA37', '#D67709', '#D63638' ] );

	return { xScale, yScale, colorScale };
};

// Initialize SVG and set dimensions
const initializeSVG = ( svgRef, width, height ) => {
	return d3Select( svgRef.current ).attr( 'width', width ).attr( 'height', height );
};

// Create gradient definition
const createGradient = ( svg, data, xScale, colorScale, margin, width ) => {
	const defs = svg.append( 'defs' );
	const gradient = defs
		.append( 'linearGradient' )
		.attr( 'id', 'line-gradient' )
		.attr( 'gradientUnits', 'userSpaceOnUse' )
		.attr( 'x1', margin.left )
		.attr( 'y1', 0 )
		.attr( 'x2', width - margin.right )
		.attr( 'y2', 0 );

	data.forEach( ( item ) => {
		gradient
			.append( 'stop' )
			.attr(
				'offset',
				`${
					( ( xScale( new Date( item.date ) ) - margin.left ) / ( width - margin.left ) ) * 100
				}%`
			)
			.attr( 'stop-color', colorScale( item.value ) )
			.attr( 'stop-opacity', 0.3 );
	} );
};

// Draw grid lines
const drawGrid = ( svg, yScale, width, margin ) => {
	svg
		.selectAll( 'line.horizontal-grid' )
		.data( yScale.ticks( MAX_TICKS ) )
		.enter()
		.append( 'line' )
		.attr( 'class', 'horizontal-grid' )
		.attr( 'x1', margin.left )
		.attr( 'x2', width - margin.right )
		.attr( 'y1', yScale )
		.attr( 'y2', yScale )
		.attr( 'stroke', '#F6F7F7' )
		.attr( 'stroke-width', 2 );
};

// Draw line with gradient
const drawLine = ( svg, data, xScale, yScale ) => {
	const lineGenerator = d3Line()
		.x( ( item ) => xScale( new Date( item.date ) ) )
		.y( ( item ) => yScale( item.value ) )
		.curve( d3MonotoneXCurve );

	svg
		.append( 'path' )
		.datum( data )
		.attr( 'd', lineGenerator )
		.attr( 'stroke', 'url(#line-gradient)' )
		.attr( 'stroke-width', 2 )
		.attr( 'fill', 'none' );
};

// Draw axes
const drawAxes = ( svg, xScale, yScale, data, margin, width, height ) => {
	const dates = data.map( ( item ) => new Date( item.date ) );

	svg
		.append( 'g' )
		.attr( 'transform', `translate(0,${ height - margin.bottom })` )
		.call(
			d3AxisBottom( xScale )
				.tickValues( dates )
				.tickFormat( d3TimeFormat( '%-m/%d' ) )
				.tickPadding( 10 )
		)
		.call( ( g ) => g.select( '.domain' ).remove() );

	svg
		.append( 'g' )
		.attr( 'transform', `translate(${ margin.left },0)` )
		.call( d3AxisLeft( yScale ).ticks( MAX_TICKS ) )
		.select( '.domain' )
		.remove();
};

// Create shape path for dots
const createShapePath = ( item, xScale, yScale, range ) => {
	const x = xScale( new Date( item.date ) );
	const y = yScale( item.value );
	const size = 7;

	if ( item.value < range[ 0 ] ) {
		return `M${ x },${ y }m-${ size },0a${ size },${ size } 0 1,0 ${
			2 * size
		},0a${ size },${ size } 0 1,0 ${ -2 * size },0Z`; // Circle
	} else if ( item.value >= range[ 1 ] ) {
		return `M${ x - size },${ y - size }h${ 2 * size }v${ 2 * size }h${ -2 * size }Z`; // Square
	}
	return `M${ x - 2 - size },${ y + size }L${ x + 2 + size },${ y + size }L${ x },${ y - size }Z`; // Triangle
};

// Show tooltip on hover
const showTooltip = ( tooltip, data, ev = null ) => {
	const event = d3Event || ev;
	tooltip.style( 'opacity', 1 );
	tooltip
		.html( data )
		.style( 'left', event.pageX - 28 + 'px' )
		.style( 'top', event.pageY - 50 + 'px' );
};

// Hide tooltip on mouse out
const hideTooltip = ( tooltip ) => {
	tooltip.style( 'opacity', 0 );
};

// Draw dots with tooltips
const drawDots = ( svg, data, xScale, yScale, colorScale, range, tooltip ) => {
	svg
		.selectAll( 'path.shape' )
		.data( data )
		.enter()
		.append( 'path' )
		.attr( 'class', 'shape' )
		.attr( 'd', ( item ) => createShapePath( item, xScale, yScale, range ) )
		.attr( 'fill', ( item ) => colorScale( item.value ) )
		.attr( 'stroke', '#fff' )
		.attr( 'stroke-width', 2.5 )
		.on( 'mouseover', ( item ) => showTooltip( tooltip, item.value ) )
		.on( 'mouseout', () => hideTooltip( tooltip ) );
};

const generateSampleData = ( range ) => {
	const data = [];
	const currentDate = new Date();
	for ( let i = 1; i <= 8; i++ ) {
		const date = new Date( currentDate );
		date.setDate( currentDate.getDate() - i * 7 );
		const point = {
			date: date.toISOString(),
			value: range[ 0 ] + Math.random() * ( range[ 1 ] - range[ 0 ] ),
		};
		data.push( point );
	}
	return data;
};

const HistoryChart = ( { data, range, height, width } ) => {
	const svgRef = createRef();
	const tooltipRef = createRef();
	const dataAvailable = data && data.length;

	if ( ! dataAvailable ) {
		data = generateSampleData( range );
	}

	useEffect( () => {
		// Clear previous chart
		d3Select( svgRef.current ).selectAll( '*' ).remove();

		const margin = { top: 20, right: 0, bottom: 40, left: 40 };

		const { xScale, yScale, colorScale } = createScales( data, range, margin, width, height );

		const svg = initializeSVG( svgRef, width, height );

		dataAvailable && createGradient( svg, data, xScale, colorScale, margin, width );

		drawGrid( svg, yScale, width, margin );

		dataAvailable && drawLine( svg, data, xScale, yScale );
		drawAxes( svg, xScale, yScale, data, margin, width, height );

		const tooltip = d3Select( tooltipRef.current ).attr( 'class', 'tooltip' );
		dataAvailable && drawDots( svg, data, xScale, yScale, colorScale, range, tooltip );
	}, [ dataAvailable, data, range, height, width ] );

	const handleInfoToolTip = ( event ) => {
		const tooltip = d3Select( tooltipRef.current );
		const data2 = 'Not enough real-world speed data is available for this page.';
		showTooltip( tooltip, data2, event );
	};

	const handleHideToolTip = () => {
		const tooltip = d3Select( tooltipRef.current );
		hideTooltip( tooltip );
	};

	return (
		<div className="chart-container">
			<div ref={ tooltipRef }></div>
			<div className="chart">
				<svg ref={ svgRef }></svg>
				{ ! dataAvailable && (
					<div className="info">
						History unavailable
						<Icon
							onMouseOver={ handleInfoToolTip }
							onMouseOut={ handleHideToolTip }
							icon={ info }
							className="icon"
						/>
					</div>
				) }
			</div>
		</div>
	);
};

export default HistoryChart;
