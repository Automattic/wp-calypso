/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';

/**
 * Internal dependencies
 */
import D3Base from 'woocommerce/components/d3/base';
import { formatValue } from 'woocommerce/app/store-stats/utils';

const HorizontalBar = ( { className, data, extent, currency, height, width } ) => {
	const numberFormat = currency ? 'currency' : 'number';
	const drawChart = ( svg, { scale, height: calculatedHeight } ) => {
		const xPos = scale( data );
		svg
			.append( 'rect' )
			.attr( 'x', 0 )
			.attr( 'y', 0 )
			.attr( 'width', xPos )
			.attr( 'height', calculatedHeight );

		const text = svg
			.append( 'text' )
			// Render text offscreen to aquire its length
			.attr( 'x', -9999 )
			.attr( 'y', -9999 )
			.attr( 'text-anchor', 'end' )
			.attr( 'fill', 'white' )
			.text( formatValue( data, numberFormat, currency ) );
		const textMargin = data === 0 ? 0 : 5;
		const isOffsetText =
			xPos + ( text.node().getBoundingClientRect().width + textMargin * 2 ) <= scale( extent[ 1 ] );
		text
			.attr( 'class', isOffsetText ? 'is-offset-text' : '' )
			.attr( 'text-anchor', isOffsetText ? 'start' : 'end' )
			.attr( 'x', isOffsetText ? xPos + textMargin : xPos - textMargin )
			.attr( 'y', calculatedHeight / 2 )
			.attr( 'dy', '0.4em' );

		return svg;
	};

	const getParams = ( node ) => {
		const calculatedWidth = width || node.offsetWidth;
		return {
			width: calculatedWidth,
			height: height || node.offsetHeight,
			scale: d3ScaleLinear().domain( extent ).range( [ 0, calculatedWidth ] ),
		};
	};

	return (
		<D3Base
			className={ classNames( 'horizontal-bar', className ) }
			drawChart={ drawChart }
			getParams={ getParams }
		/>
	);
};

HorizontalBar.propTypes = {
	className: PropTypes.string,
	currency: PropTypes.string,
	data: PropTypes.number.isRequired,
	extent: PropTypes.arrayOf( PropTypes.number ).isRequired,
	height: PropTypes.number,
	width: PropTypes.number,
};

export default HorizontalBar;
