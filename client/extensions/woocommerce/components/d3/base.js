/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { select as d3Select } from 'd3-selection';

export class D3Base extends Component {
	constructor( props ) {
		super( props );
		this.state = props.initialState;
	}

	componentDidMount() {
		window.addEventListener( 'resize', this.handleResize );
		const { updateState } = this.props;
		/**
		 * Calling setState() in this method will trigger an extra rendering,
		 * but it will happen before the browser updates the screen.
		 *
		 * ~ https://reactjs.org/docs/react-component.html
		 */
		/* eslint-disable react/no-did-mount-set-state */
		this.setState( updateState( this.node ), this.draw );
		/* eslint-enable react/no-did-mount-set-state */
	}

	componentDidUpdate() {
		this.draw();
	}

	componentWillReceiveProps() {
		const { updateState } = this.props;
		this.setState( updateState( this.node ), this.draw );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.handleResize );
		delete this.node;
	}

	draw() {
		this.props.drawChart( this.createNewContext(), this.state );
	}

	createNewContext() {
		const { className } = this.props;
		const { width, height } = this.state;

		d3Select( this.node )
			.selectAll( 'svg' )
			.remove();
		const newNode = d3Select( this.node )
			.append( 'svg' )
			.attr( 'class', `${ className }__viewbox` )
			.attr( 'viewBox', `0 0 ${ width } ${ height }` )
			.attr( 'preserveAspectRatio', 'xMidYMid meet' )
			.append( 'g' );
		return newNode;
	}

	setNodeRef = node => {
		this.node = node;
	};

	render() {
		return <div className={ this.props.className } ref={ this.setNodeRef } />;
	}
}
