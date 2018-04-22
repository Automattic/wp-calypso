/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isEqual } from 'lodash';
import { select as d3Select } from 'd3-selection';

export default class D3Base extends Component {
	static propTypes = {
		className: PropTypes.string,
		data: PropTypes.any, // required to detect changes in data
		drawChart: PropTypes.func.isRequired,
		getParams: PropTypes.func.isRequired,
	};

	state = {};

	constructor( props ) {
		super( props );

		this.chartRef = React.createRef();
	}
	componentDidMount() {
		window.addEventListener( 'resize', this.updateParams );

		this.updateParams();
	}

	componentWillReceiveProps( nextProps ) {
		// make sure we don't update the state when the props have not changed
		// it would cause the svg component to be re-created, thus losing any bound events one could have set
		if ( ! isEqual( this.props, nextProps ) ) {
			this.updateParams( nextProps );
		}
	}

	shouldComponentUpdate( nextProps, nextState ) {
		// make sure we don't re-render if the state has not changed
		return ! isEqual( this.state, nextState );
	}

	componentDidUpdate() {
		this.draw();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.updateParams );

		delete this.chartRef.current;
	}

	updateParams = nextProps => {
		const getParams = ( nextProps && nextProps.getParams ) || this.props.getParams;

		this.setState( getParams( this.chartRef.current ), this.draw );
	};

	draw() {
		this.props.drawChart( this.createNewContext(), this.state );
	}

	createNewContext() {
		const { className } = this.props;
		const { width, height } = this.state;

		const div = d3Select( this.chartRef.current );

		div.selectAll( 'svg' ).remove();

		const svg = div
			.append( 'svg' )
			.attr( 'viewBox', `0 0 ${ width } ${ height }` )
			.attr( 'preserveAspectRatio', 'xMidYMid meet' );

		if ( className ) {
			svg.attr( 'class', `${ className }__viewbox` );
		}

		return svg.append( 'g' );
	}

	render() {
		return (
			<div className={ classNames( 'd3-base', this.props.className ) } ref={ this.chartRef } />
		);
	}
}
