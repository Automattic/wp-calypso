/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import User from 'lib/user';
import userSettings from 'lib/user-settings';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import SupportUserDialog from './dialog';

import { activateSupportUser, deactivateSupportUser } from 'state/support/actions';

const SupportUser = React.createClass( {
	displayName: 'SupportUser',

	mixins: [ observe( 'userSettings' ) ],

	componentDidMount: function() {
		KeyboardShortcuts.on( 'open-support-user', this.toggleShowDialog );
	},

	componentWillUnmount: function() {
		KeyboardShortcuts.off( 'open-support-user', this.toggleShowDialog );
	},

	getInitialState: function() {
		return {
			showDialog: false,
			errorMessage: null,
			user: null
		};
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
			this.setState( { showDialog: ! this.state.showDialog  } );
		}
	},

	closeDialog: function() {
		this.setState( { showDialog: false } );
	},

	onTokenError: function( error ) {
		this.setState( {
				showDialog: true,
				errorMessage: error.message,
				user: null
		} );
		this.props.deactivateSupportUser();
	},

	onChangeUser: function( supportUser, supportPassword ) {
		let user = new User();
		let myUser = Object.assign( {}, user.data );
		this.setState( { user: myUser } );

		if ( supportUser && supportPassword ) {
			user.clear();
			user.changeUser(
				supportUser,
				supportPassword,
				( error ) => this.onTokenError( error )
			);
			this.props.activateSupportUser();
		}

		this.setState( { showDialog: false } );
		this.setState( { errorMessage: null } );
	},

	onRestoreUser: function( e ) {
		e.preventDefault();

		if ( this.props.isSupportUser ) {
			let user = new User();
			user.clear().fetch();
			this.setState( {
				showDialog: false,
				errorMessage: null,
				user: null
			} );
			this.props.deactivateSupportUser();
			window.location.reload.bind( window.location );
		}
	},

	render: function() {
		return (
			<SupportUserDialog
				isVisible={ this.state.showDialog }
				errorMessage={ this.state.errorMessage }
				user={ this.state.user }
				isLoggedIn={ this.props.isSupportUser }
				
				onCloseDialog={ this.closeDialog }
				onChangeUser={ this.onChangeUser }
				onRestoreUser={ this.onRestoreUser }
			/>
		);
	}
} );

const mapStateToProps = ( state ) => {
	return {
		isSupportUser: state.support.isSupportUser
	}
}

export default connect(
	mapStateToProps,
	{ activateSupportUser, deactivateSupportUser }
)( SupportUser );