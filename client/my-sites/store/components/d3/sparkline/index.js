import clsx from 'clsx';
import { extent as d3Extent } from 'd3-array';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import PropTypes from 'prop-types';
import D3Base from '../base';

const Sparkline = ( {
	aspectRatio,
	className,
	data,
	highlightIndex,
	highlightRadius,
	margin,
	maxHeight,
} ) => {
	function drawSparkline( svg, params ) {
		const { xScale, yScale } = params;
		const sparkline = d3Line()
			.x( ( d, i ) => xScale( i ) )
			.y( ( d ) => yScale( d ) );
		return svg.append( 'path' ).attr( 'class', 'sparkline__line' ).attr( 'd', sparkline( data ) );
	}

	function drawHighlight( svg, params ) {
		const { xScale, yScale } = params;
		return svg
			.append( 'circle' )
			.attr( 'class', 'sparkline__highlight' )
			.attr( 'r', highlightRadius )
			.attr( 'cx', xScale( highlightIndex ) )
			.attr( 'cy', yScale( data[ highlightIndex ] ) );
	}

	function drawChart( svg, params ) {
		drawSparkline( svg, params );
		drawHighlight( svg, params );
	}

	function getParams( node ) {
		const newWidth = node.offsetWidth;
		const newHeight =
			maxHeight && maxHeight < newWidth / aspectRatio ? maxHeight : newWidth / aspectRatio;

		return {
			width: newWidth,
			height: newHeight,
			xScale: d3ScaleLinear()
				.domain( d3Extent( data, ( d, i ) => i ) )
				.range( [ margin.left, newWidth - margin.right ] ),
			yScale: d3ScaleLinear()
				.domain( d3Extent( data, ( d ) => d ) )
				.range( [ newHeight - margin.bottom, margin.top ] ),
		};
	}

	return (
		<D3Base
			className={ clsx( 'sparkline', className ) }
			drawChart={ drawChart }
			getParams={ getParams }
		/>
	);
};

Sparkline.propTypes = {
	aspectRatio: PropTypes.number,
	className: PropTypes.string,
	data: PropTypes.array.isRequired,
	highlightIndex: PropTypes.number,
	highlightRadius: PropTypes.number,
	margin: PropTypes.object,
	maxHeight: PropTypes.number,
};

Sparkline.defaultProps = {
	aspectRatio: 4.5,
	highlightRadius: 3.5,
	margin: {
		top: 4,
		right: 4,
		bottom: 4,
		left: 4,
	},
};

export default Sparkline;
