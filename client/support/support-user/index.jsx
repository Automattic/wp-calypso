/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import { rebootNormally } from 'lib/user/support-user-interop';
import { isSupportSession } from 'state/support/selectors';

class SupportUser extends Component {
	componentDidMount() {
		KeyboardShortcuts.on( 'exit-support-user', this.onKeyboardShortcut );
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'exit-support-user', this.onKeyboardShortcut );
	}

	onKeyboardShortcut = () => {
		if ( this.props.isSupportSession ) {
			rebootNormally();
		}
	};

	render() {
		return null;
	}
}

export default connect( ( state ) => ( {
	isSupportSession: isSupportSession( state ),
} ) )( SupportUser );
