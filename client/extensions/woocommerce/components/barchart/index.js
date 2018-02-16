/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { extent as d3Extent, max } from 'd3-array';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { select as d3Select } from 'd3-selection';
import { line as d3Line } from 'd3-shape';

/**
 * Internal dependencies
 */

class BarChart extends Component {
	constructor( props ) {
		super( props );
		this.createBarChart = this.createBarChart.bind( this );
	}
	componentDidMount() {
		this.createBarChart();
	}
	componentDidUpdate() {
		this.createBarChart();
	}
	createBarChart() {
		const node = this.node;
		const dataMax = max( this.props.data );
		const xScale = d3ScaleLinear()
			.domain( [ 0, dataMax ] )
			.range( [ 0, 200 ] );

		d3Select( node )
			.selectAll( 'rect' )
			.data( this.props.data )
			.enter()
			.append( 'rect' );

		d3Select( node )
			.selectAll( 'rect' )
			.data( this.props.data )
			.exit()
			.remove();

		d3Select( node )
			.selectAll( 'rect' )
			.data( this.props.data )
			.style( 'fill', '#fe9922' )
			.attr( 'x', d => 0 )
			.attr( 'y', ( d, i ) => 100 - i * 10 )
			.attr( 'height', 10 )
			.attr( 'width', d => xScale( d ) );
	}
	render() {
		return <svg ref={ node => ( this.node = node ) } width={ 200 } height={ 100 } />;
	}
}
export default BarChart;
