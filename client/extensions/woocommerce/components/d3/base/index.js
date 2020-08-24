/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { select as d3Select } from 'd3-selection';

export default class D3Base extends Component {
	static propTypes = {
		className: PropTypes.string,
		drawChart: PropTypes.func.isRequired,
		getParams: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.updateParams = this.updateParams.bind( this );
	}

	state = {};

	componentDidMount() {
		window.addEventListener( 'resize', this.updateParams );
		this.updateParams();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.updateParams( nextProps );
	}

	componentDidUpdate() {
		this.draw();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.updateParams );
		delete this.node;
	}

	updateParams( nextProps ) {
		const getParams = ( nextProps && nextProps.getParams ) || this.props.getParams;
		this.setState( getParams( this.node ), this.draw );
	}

	draw() {
		this.props.drawChart( this.createNewContext(), this.state );
	}

	createNewContext() {
		const { className } = this.props;
		const { width, height } = this.state;

		d3Select( this.node ).selectAll( 'svg' ).remove();
		const newNode = d3Select( this.node )
			.append( 'svg' )
			.attr( 'class', `${ className }__viewbox` )
			.attr( 'viewBox', `0 0 ${ width } ${ height }` )
			.attr( 'preserveAspectRatio', 'xMidYMid meet' )
			.append( 'g' );
		return newNode;
	}

	setNodeRef = ( node ) => {
		this.node = node;
	};

	render() {
		return (
			<div className={ classNames( 'd3-base', this.props.className ) } ref={ this.setNodeRef } />
		);
	}
}
