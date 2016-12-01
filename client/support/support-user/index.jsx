/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import SupportUserLoginDialog from './login-dialog';
import { fetchToken, rebootNormally } from 'lib/user/support-user-interop';
import { currentUserHasFlag } from 'state/current-user/selectors';

import { supportUserToggleDialog } from 'state/support/actions';

const SupportUser = React.createClass( {
	displayName: 'SupportUser',

	componentDidMount: function() {
		KeyboardShortcuts.on( 'open-support-user', this.onKeyboardShortcut );
	},

	componentWillUnmount: function() {
		KeyboardShortcuts.off( 'open-support-user', this.onKeyboardShortcut );
	},

	onKeyboardShortcut: function( e ) {
		if ( this.props.isSupportUser ) {
			rebootNormally();
		}

		if ( ! this.props.isEnabledForUser ) {
			return;
		}

		// Because the username field is auto-focused, this prevents
		// the shortcut key being entered into the field
		e.preventDefault();

		this.props.supportUserToggleDialog();
	},

	render: function() {
		return (
			<SupportUserLoginDialog
				isVisible={ this.props.showDialog }
				isBusy={ this.props.isTransitioning }
				isLoggedIn={ this.props.isSupportUser }
				errorMessage={ this.props.errorMessage }

				onCloseDialog={ this.props.supportUserToggleDialog }
				onChangeUser={ fetchToken }
			/>
		);
	}
} );

const mapStateToProps = state => ( {
	isEnabledForUser: currentUserHasFlag( state, 'calypso_support_user' ),
	isSupportUser: state.support.isSupportUser,
	isTransitioning: state.support.isTransitioning,
	showDialog: state.support.showDialog,
	errorMessage: state.support.errorMessage,
} );

const mapDispatchToProps = {
	supportUserToggleDialog,
};

export default connect( mapStateToProps, mapDispatchToProps )( SupportUser );
