/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { select as d3Select } from 'd3-selection';

export default class D3Base extends Component {
	static propTypes = {
		className: PropTypes.string,
		drawChart: PropTypes.func.isRequired,
		getParams: PropTypes.func.isRequired,
	};

	state = {};

	componentDidMount() {
		window.addEventListener( 'resize', this.updateParams );

		this.updateParams();
	}

	componentWillReceiveProps( nextProps ) {
		this.updateParams( nextProps );
	}

	componentDidUpdate() {
		this.draw();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.updateParams );

		delete this.node;
	}

	updateParams = ( nextProps ) => {
		const getParams = ( nextProps && nextProps.getParams ) || this.props.getParams;

		this.setState( getParams( this.node ), this.draw );
	};

	draw() {
		this.props.drawChart( this.createNewContext(), this.state );
	}

	createNewContext() {
		const { className } = this.props;
		const { width, height } = this.state;

		d3Select( this.node )
			.selectAll( 'svg' )
			.remove();

		return d3Select( this.node )
			.append( 'svg' )
			.attr( 'class', `${ className }__viewbox` )
			.attr( 'viewBox', `0 0 ${ width } ${ height }` )
			.attr( 'preserveAspectRatio', 'xMidYMid meet' )
			.append( 'g' );
	}

	setNodeRef = node => {
		this.node = node;
	};

	render() {
		return (
			<div className={ classNames( 'd3-base', this.props.className ) } ref={ this.setNodeRef } />
		);
	}
}
