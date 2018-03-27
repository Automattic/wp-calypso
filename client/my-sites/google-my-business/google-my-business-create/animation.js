/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { Transition } from 'react-transition-group';

/**
 * Internal dependencies
 */

import AnimateHeight from 'react-animate-height';

const duration = 200;

const defaultStyle = {
	transition: `opacity ${ duration }ms ease-in-out`,
	opacity: 0,
};

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { opacity: 1 },
};

class Animation extends Component {
	state = {
		height: 0,
	};

	handleEnter = () => {
		console.log( 'handleEnter' );
	};

	handleEntering = () => {
		console.log( 'handleEntering' );
		this.setState( {
			height: 'auto',
		} );
	};

	handleEntered = () => {
		console.log( 'handleEntered' );
	};

	handleExit = () => {
		console.log( 'handleExit' );
		this.setState( {
			height: 0,
		} );
	};

	handleExiting = () => {
		console.log( 'handleExiting' );
	};

	handleExited = () => {
		console.log( 'handleExited' );
	};

	render() {
		return (
			<Transition
				in={ this.props.in }
				appear={ true }
				timeout={ 200 }
				onEnter={ this.handleEnter }
				onEntering={ this.handleEntering }
				onEntered={ this.handleEntered }
				onExit={ this.handleExit }
				onExiting={ this.handleExiting }
				onExited={ this.handleExited }
			>
				{ state => (
					<div
						style={ {
							...defaultStyle,
							...transitionStyles[ state ],
						} }
					>
						<AnimateHeight duration={ 200 } height={ this.state.height }>
							{ this.props.children }
						</AnimateHeight>
					</div>
				) }
			</Transition>
		);
	}
}

export default connect( undefined, undefined )( localize( Animation ) );
