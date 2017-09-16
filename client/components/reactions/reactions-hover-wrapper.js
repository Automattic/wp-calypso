/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
	MOUSE_ENTER_TIMEOUT_DURATION,
	MOUSE_LEAVE_TIMEOUT_DURATION,
} from './constants';

export default class ReactionsHoverWrapper extends Component {
	static propTypes = {
		onHover: PropTypes.func.isRequired,
		onUnhover: PropTypes.func.isRequired,
	};

	state = {
		hovering: false,
	};

	clearTimeouts = () => {
		clearTimeout( this.unHoverTimeout );
		clearTimeout( this.hoverTimeout );
	}

	onBtnMouseEnter = () => {
		this.clearTimeouts();
		this.hoverTimeout = setTimeout( () => {
			this.setState( {
				hovering: true,
			} );
		}, MOUSE_ENTER_TIMEOUT_DURATION );
	};

	onBtnMouseLeave = () => {
		this.clearTimeouts();
		this.unHoverTimeout = setTimeout( () => {
			this.setState( {
				hovering: false,
			} );
		}, MOUSE_LEAVE_TIMEOUT_DURATION );
	};

	componentWillUpdate( nextProps, nextState ) {
		if ( ! this.state.hovering && nextState.hovering ) {
			this.props.onHover();
		} else if ( this.state.hovering && ! nextState.hovering ) {
			this.props.onUnhover();
		}
	}

	componentWillUnmount() {
		this.clearTimeouts();
	}

	render() {
		return (
			<div
				className="reactions__hover-wrapper"
				onMouseEnter={ this.onBtnMouseEnter }
				onMouseLeave={ this.onBtnMouseLeave }
			>{ this.props.children }
			</div>
		);
	}
}
