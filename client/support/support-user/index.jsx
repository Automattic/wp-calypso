/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import KeyboardShortcuts from 'client/lib/keyboard-shortcuts';
import SupportUserLoginDialog from './login-dialog';
import { fetchToken, rebootNormally } from 'client/lib/user/support-user-interop';
import { currentUserHasFlag } from 'client/state/current-user/selectors';
import { supportUserToggleDialog, supportUserSetUsername } from 'client/state/support/actions';

class SupportUser extends Component {
	componentDidMount() {
		KeyboardShortcuts.on( 'open-support-user', this.onKeyboardShortcut );
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'open-support-user', this.onKeyboardShortcut );
	}

	onKeyboardShortcut = e => {
		if ( this.props.isSupportUser ) {
			rebootNormally();
		}

		if ( ! this.props.isEnabledForUser ) {
			return;
		}

		// Because the username field is auto-focused, this prevents
		// the shortcut key being entered into the field
		e.preventDefault();

		this.props.toggleDialog();
	};

	render() {
		return <SupportUserLoginDialog { ...this.props } onChangeUser={ fetchToken } />;
	}
}

const mapStateToProps = state => ( {
	isEnabledForUser: currentUserHasFlag( state, 'calypso_support_user' ),
	isSupportUser: state.support.isSupportUser,
	isBusy: state.support.isTransitioning,
	isVisible: state.support.showDialog,
	errorMessage: state.support.errorMessage,
	username: state.support.username,
} );

const mapDispatchToProps = {
	toggleDialog: supportUserToggleDialog,
	setUsername: supportUserSetUsername,
};

export default connect( mapStateToProps, mapDispatchToProps )( SupportUser );
