/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { modifierKeyIsActive, shortcutsAreEnabled } from '../helpers/input';

const dispatch = ( event, action ) => {
	event.preventDefault();
	event.stopPropagation();

	action();
};

export class HotkeyContainer extends Component {
	static propTypes = {
		shortcuts: PropTypes.arrayOf(
			PropTypes.shape( {
				action: PropTypes.func.isRequired,
				hotkey: PropTypes.number.isRequired,
				withModifiers: PropTypes.bool,
			} )
		),
	};

	componentDidMount() {
		window.addEventListener( 'keydown', this.handleKeyDown, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.handleKeyDown, false );
	}

	handleKeyDown = ( event ) => {
		if ( ! this.props.shortcuts || ! shortcutsAreEnabled() ) {
			return;
		}

		this.props.shortcuts
			.filter( ( shortcut ) => shortcut.hotkey === event.keyCode )
			.filter(
				( shortcut ) => ( shortcut.withModifiers || false ) === modifierKeyIsActive( event )
			)
			.forEach( ( shortcut ) => dispatch( event, shortcut.action ) );
	};

	render() {
		return this.props.children;
	}
}

export default HotkeyContainer;
