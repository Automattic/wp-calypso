/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import compose from 'lodash/function/compose';

/**
 * Internal dependencies
 */
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import SupportUserLoginDialog from './login-dialog';

import {
	supportUserTokenFetch,
	supportUserRestore,
	supportUserToggleDialog,
} from 'state/support/actions';
import { isSupportUser } from 'state/support/selectors';

const SupportUser = React.createClass( {
	displayName: 'SupportUser',

	componentDidMount: function() {
		KeyboardShortcuts.on( 'open-support-user', this.onKeyboardShortcut );
	},

	componentWillUnmount: function() {
		KeyboardShortcuts.off( 'open-support-user', this.onKeyboardShortcut );
	},

	onKeyboardShortcut: function() {
		if ( this.props.isSupportUser ) {
			this.props.supportUserRestore();
		} else {
			this.props.supportUserToggleDialog();
		}
	},

	render: function() {
		return (
			<SupportUserLoginDialog
				isVisible={ this.props.showDialog }
				isBusy={ this.props.isTransitioning }
				isLoggedIn={ this.props.isSupportUser }

				onCloseDialog={ this.props.supportUserToggleDialog }
				onChangeUser={ this.props.supportUserTokenFetch }
			/>
		);
	}
} );

const mapStateToProps = ( state ) => {
	return {
		isSupportUser: isSupportUser( state ),
		isTransitioning: state.support.isTransitioning,
		showDialog: state.support.showDialog,
	}
}

const mapDispatchToProps = ( dispatch ) => {
	return {
		supportUserTokenFetch: compose( dispatch, supportUserTokenFetch ),
		supportUserRestore: compose( dispatch, supportUserRestore ),
		supportUserToggleDialog: compose( dispatch, supportUserToggleDialog ),
	}
}

export default connect( mapStateToProps, mapDispatchToProps )( SupportUser );
