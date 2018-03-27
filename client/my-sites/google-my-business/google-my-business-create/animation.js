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

class Animation extends Component {
	state = {
		height: 0,
	};

	handleEnter = () => {
		console.log( 'handleEnter' );
	};

	handleEntering = () => {
		console.log( 'handleEntering' );
	};

	handleEntered = () => {
		console.log( 'handleEntered' );
		this.setState( {
			height: 'auto',
		} );
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
				timeout={ 500 }
				onEnter={ this.handleEnter }
				onEntering={ this.handleEntering }
				onEntered={ this.handleEntered }
				onExit={ this.handleExit }
				onExiting={ this.handleExiting }
				onExited={ this.handleExited }
			>
				<AnimateHeight duration={ 500 } height={ this.state.height }>
					{ this.props.children }
				</AnimateHeight>
			</Transition>
		);
	}
}

export default connect( undefined, undefined )( localize( Animation ) );
