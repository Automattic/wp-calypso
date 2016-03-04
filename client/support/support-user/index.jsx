/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import flowRight from 'lodash/flowRight';

/**
 * Internal dependencies
 */
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import SupportUserLoginDialog from './login-dialog';
import SupportUserActiveDialog from './active-dialog';
import { fetchToken, rebootNormally } from 'lib/user/support-user-interop';

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
		// Because the username field is auto-focused, this prevents
		// the shortcut key being entered into the field
		e.preventDefault();

		this.props.supportUserToggleDialog();
	},

	render: function() {
		if ( this.props.isSupportUser ) {
			return (
				<SupportUserActiveDialog
					isVisible={ this.props.showDialog }
					onCloseDialog={ this.props.supportUserToggleDialog }
					onRestoreUser={ this.props.supportUserRestore } />
			);
		}

		return (
			<SupportUserLoginDialog
				isVisible={ this.props.showDialog }
				isBusy={ this.props.isTransitioning }
				isLoggedIn={ this.props.isSupportUser }
				errorMessage={ this.props.errorMessage }

				onCloseDialog={ this.props.supportUserToggleDialog }
				onChangeUser={ this.props.supportUserTokenFetch }
			/>
		);
	}
} );

const mapStateToProps = ( state ) => {
	return {
		isSupportUser: state.support.isSupportUser,
		isTransitioning: state.support.isTransitioning,
		showDialog: state.support.showDialog,
		errorMessage: state.support.errorMessage,
	};
}

const mapDispatchToProps = ( dispatch ) => {
	return {
		supportUserTokenFetch: fetchToken,
		supportUserRestore: rebootNormally,
		supportUserToggleDialog: flowRight( dispatch, supportUserToggleDialog ),
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( SupportUser );
