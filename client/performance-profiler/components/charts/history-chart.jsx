import { useResizeObserver } from '@wordpress/compose';
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
import { useTranslate } from 'i18n-calypso';
import React, { createRef, useEffect } from 'react';
import './style.scss';

const MAX_TICKS = 4;

// Create scales for the chart
const createScales = ( data, range, margin, width, height ) => {
	const xScale = d3TimeScale()
		.domain( d3Extent( data, ( item ) => new Date( item.date ) ) )
		.range( [ margin.left + 20, width - margin.right - 20 ] );

	const maxItemValue = d3Max( data, ( item ) => item.value );

	const yScale = d3ScaleLinear()
		.domain( [ 0, maxItemValue === 0 ? 1 : maxItemValue * 1.5 ] )
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
		.attr( 'stroke-width', 1 );
};

// Draw line with gradient
const drawLine = ( svg, data, xScale, yScale ) => {
	const lineGenerator = d3Line()
		.defined( ( d ) => ! isNaN( d.value ) )
		.x( ( item ) => xScale( new Date( item.date ) ) )
		.y( ( item ) => {
			const value = item.value;
			return isNaN( value ) ? null : yScale( item.value );
		} )
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
const drawAxes = ( svg, xScale, yScale, data, margin, width, height, d3Format, isMobile ) => {
	const dates = data.map( ( item ) => new Date( item.date ) );

	const axis = svg
		.append( 'g' )
		.attr( 'transform', `translate(0,${ height - margin.bottom })` )
		.call(
			d3AxisBottom( xScale )
				.tickValues( dates )
				.tickFormat( d3TimeFormat( d3Format ) )
				.tickPadding( 10 )
		)
		.call( ( g ) => g.select( '.domain' ).remove() );

	if ( isMobile ) {
		axis.selectAll( 'text' ).attr( 'transform', 'rotate(-45)' ).style( 'text-anchor', 'end' );
	}

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

	const cornerRadius = 3;
	if ( item.value < range[ 0 ] ) {
		return `M${ x },${ y }m-${ size },0a${ size },${ size } 0 1,0 ${
			2 * size
		},0a${ size },${ size } 0 1,0 ${ -2 * size },0Z`; // Circle
	} else if ( item.value >= range[ 1 ] ) {
		return `M${ x - size + cornerRadius },${ y - size }
            h${ size * 2 - cornerRadius * 2 }
            a${ cornerRadius },${ cornerRadius } 0 0 1 ${ cornerRadius },${ cornerRadius }
            v${ size * 2 - cornerRadius * 2 }
            a${ cornerRadius },${ cornerRadius } 0 0 1 -${ cornerRadius },${ cornerRadius }
            h-${ size * 2 - cornerRadius * 2 }
            a${ cornerRadius },${ cornerRadius } 0 0 1 -${ cornerRadius },-${ cornerRadius }
            v-${ size * 2 - cornerRadius * 2 }
            a${ cornerRadius },${ cornerRadius } 0 0 1 ${ cornerRadius },-${ cornerRadius }Z`; // Square
	}
	return `M${ x - 2 - size },${ y + size }L${ x + 2 + size },${ y + size }L${ x },${ y - size }Z`; // Triangle
};

// Show tooltip on hover
const showTooltip = ( tooltip, data, ev = null ) => {
	const event = d3Event || ev;
	tooltip.style( 'opacity', 1 );
	tooltip
		.html( data )
		.style( 'left', event.layerX - 28 + 'px' )
		.style( 'top', event.layerY - 50 + 'px' );
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

const HistoryChart = ( { data, range, height, d3Format = '%-m/%d', isMobile } ) => {
	const translate = useTranslate();
	const svgRef = createRef();
	const tooltipRef = createRef();
	const dataAvailable = data && data.some( ( e ) => e.value !== null );

	if ( ! dataAvailable ) {
		data = generateSampleData( range );
	}

	const [ resizeObserverRef, entry ] = useResizeObserver();

	useEffect( () => {
		if ( ! entry ) {
			return;
		}
		// Clear previous chart
		d3Select( svgRef.current ).selectAll( '*' ).remove();

		const width = entry.width;
		const margin = { top: 20, right: 20, bottom: isMobile ? 60 : 40, left: 50 };

		const { xScale, yScale, colorScale } = createScales( data, range, margin, width, height );

		const svg = initializeSVG( svgRef, width, height );

		dataAvailable && createGradient( svg, data, xScale, colorScale, margin, width );

		drawGrid( svg, yScale, width, margin );

		dataAvailable && drawLine( svg, data, xScale, yScale );
		drawAxes( svg, xScale, yScale, data, margin, width, height, d3Format, isMobile );

		const tooltip = d3Select( tooltipRef.current ).attr( 'class', 'tooltip' );
		dataAvailable && drawDots( svg, data, xScale, yScale, colorScale, range, tooltip );
	}, [ dataAvailable, data, range, svgRef, tooltipRef, height, entry, d3Format ] );

	return (
		<div className="chart-container">
			{ resizeObserverRef }
			<div ref={ tooltipRef }></div>
			<div className="chart">
				<svg ref={ svgRef }></svg>
				{ ! dataAvailable && (
					<div className="info">
						<p className="heading">{ translate( 'No history available' ) }</p>
						<p>
							{ translate(
								'The Chrome User Experience Report collects speed data from real site visits. Sites with low-traffic don‘t provide enough data to generate historical trends.'
							) }
						</p>
					</div>
				) }
			</div>
		</div>
	);
};

export default HistoryChart;
