/** @format */

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
import { currentUserHasFlag } from 'state/current-user/selectors';

class SupportUser extends Component {
	componentDidMount() {
		KeyboardShortcuts.on( 'exit-support-user', this.onKeyboardShortcut );
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'exit-support-user', this.onKeyboardShortcut );
	}

	onKeyboardShortcut = () => {
		if ( this.props.isSupportUser ) {
			rebootNormally();
		}
	};

	render() {
		return null;
	}
}

const mapStateToProps = state => ( {
	isEnabledForUser: currentUserHasFlag( state, 'calypso_support_user' ),
	isSupportUser: state.support.isSupportUser,
} );

export default connect( mapStateToProps )( SupportUser );
