/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'lodash';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import userSettings from 'lib/user-settings';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import SupportUserDialog from './dialog';

import { 
	activateSupportUser, 
	deactivateSupportUser,
	fetchSupportUserToken,
	restoreSupportUser,
	toggleSupportUserDialog
} from 'state/support/actions';

const SupportUser = React.createClass( {
	displayName: 'SupportUser',

	mixins: [ observe( 'userSettings' ) ],

	componentDidMount: function() {
		KeyboardShortcuts.on( 'open-support-user', this.toggleShowDialog );
	},

	componentWillUnmount: function() {
		KeyboardShortcuts.off( 'open-support-user', this.toggleShowDialog );
	},

	isEnabled: function() {
		if ( this.props.isSupportUser ) {
			return true;
		}

		if ( ! userSettings.hasSettings() ) {
			userSettings.fetchSettings();
			return false;
		}
		return ! userSettings.getSetting( 'user_login_can_be_changed' );
	},

	toggleShowDialog: function() {
		if ( this.isEnabled() ) {
			this.props.toggleSupportUserDialog();
		}
	},

	render: function() {
		return (
			<SupportUserDialog
				isVisible={ this.props.showDialog }
				isBusy={ this.props.isTransitioning }
				errorMessage={ this.props.errorMessage }
				user={ this.props.userData }
				isLoggedIn={ this.props.isSupportUser }
				
				onCloseDialog={ this.props.toggleSupportUserDialog }
				onChangeUser={ this.props.fetchSupportUserToken }
				onRestoreUser={ this.props.restoreSupportUser }
			/>
		);
	}
} );

const mapStateToProps = ( state ) => {
	return {
		isSupportUser: state.support.isSupportUser,
		isTransitioning: state.support.isTransitioning,
		userData: state.support.userData,
		showDialog: state.support.showDialog,
		errorMessage: state.support.errorMessage
	}
}

const mapDispatchToProps = ( dispatch ) => {
	return {
		activateSupportUser: compose( dispatch, activateSupportUser ),
		deactivateSupportUser: compose( dispatch, deactivateSupportUser ),
		fetchSupportUserToken: compose( dispatch, fetchSupportUserToken ),
		restoreSupportUser: compose( dispatch, restoreSupportUser ),
		toggleSupportUserDialog: compose( dispatch, toggleSupportUserDialog ),
	}
}

export default connect( mapStateToProps, mapDispatchToProps )( SupportUser );
