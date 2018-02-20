/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { max as d3Max } from 'd3-array';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { select as d3Select } from 'd3-selection';
import { D3Base } from 'woocommerce/components/d3/base';

/**
 * Internal dependencies
 */

const VerticalBarChart = ( {
	aspectRatio,
	className,
	data,
	highlightIndex,
	margin,
	maxHeight,
} ) => {
	function drawChart( svg, params ) {
		const { xScale, yInterval } = params;

		return svg
			.selectAll( 'rect' )
			.data( data )
			.enter()
			.append( 'rect' )
			.attr( 'class', 'verticalbarchart__bar' )
			.attr( 'x', d => margin.left )
			.attr( 'y', ( d, i ) => i * yInterval + i * yInterval * ( 9 / 16 ) )
			.attr( 'height', yInterval )
			.attr( 'width', d => xScale( d ) );
	}

	function getParams( node ) {
		const newWidth = node.offsetWidth;
		const newHeight =
			maxHeight && maxHeight < newWidth / aspectRatio ? maxHeight : newWidth / aspectRatio;
		const interval = newHeight / ( 25 / 16 * data.length - 9 / 16 );

		return {
			width: newWidth,
			height: newHeight,
			xScale: d3ScaleLinear()
				.domain( [ 0, d3Max( data ) ] )
				.range( [ margin.left, newWidth - margin.right ] ),
			yInterval: interval,
		};
	}

	return (
		<D3Base
			className={ classNames( 'verticalbarchart', className ) }
			drawChart={ drawChart }
			getParams={ getParams }
		/>
	);
};

VerticalBarChart.propTypes = {
	aspectRatio: PropTypes.number,
	className: PropTypes.string,
	data: PropTypes.array.isRequired,
	highlightIndex: PropTypes.number,
	margin: PropTypes.object,
	maxHeight: PropTypes.number,
};

VerticalBarChart.defaultProps = {
	aspectRatio: 4.5,
	margin: {
		top: 4,
		right: 4,
		bottom: 4,
		left: 4,
	},
};

export default VerticalBarChart;
