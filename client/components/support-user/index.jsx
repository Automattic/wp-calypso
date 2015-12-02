/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import User from 'lib/user';
import userSettings from 'lib/user-settings';
import Dialog from 'components/dialog';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';

module.exports = React.createClass( {
	displayName: 'SupportUser',

	mixins: [ observe( 'userSettings' ), React.addons.LinkedStateMixin ],

	componentDidMount: function() {
		KeyboardShortcuts.on( 'open-support-user', this.toggleShowDialog );
	},

	componentWillUnmount: function() {
		KeyboardShortcuts.off( 'open-support-user', this.toggleShowDialog );
	},

	getInitialState: function() {
		return {
			supportUser: null,
			isSupportUser: false,
			showDialog: false
		};
	},

	isEnabled: function() {
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
	},

	onChangeUser: function( e ) {
		e.preventDefault();

		if ( this.state.supportUser && this.state.supportPassword ) {
			let user = new User();
			user.clear();
			user.changeUser( this.state.supportUser, this.state.supportPassword );
			this.setState( { isSupportUser: true } );
			this.setState( { supportPassword: null } );
		}

		this.setState( { showDialog: false } );
	},

	onRestoreUser: function( e ) {
		if ( this.state.isSupportUser && this.state.restoreUser ) {
			let user = new User();
			user.clear().fetch();
			this.setState( {
				supportUser: null,
				supportPassword: null,
				isSupportUser: false,
				showDialog: false
			} );
			window.location.reload.bind( window.location );
		}
	},

	render: function() {
		if ( this.state.isSupportUser ) {
		return (
			<Dialog additionalClassNames="support-user" isVisible={ this.state.showDialog } onClose={ this.closeDialog }>
			<div className="restore-user">
				<form onSubmit={ this.onRestoreUser }>
					<button type="submit" className="button">
					Restore User
					</button>
				</form>
			</div>
			</Dialog>
		);
		} else {
		return (
			<Dialog additionalClassNames="support-user" isVisible={ this.state.showDialog } onClose={ this.closeDialog }>
			<div className="support-user">
				<form onSubmit={ this.onChangeUser }>
					<label>
					Username
					<input
						type="text"
						name="supportUser"
						id="supportUser"
						valueLink={ this.linkState( 'supportUser' ) }
					/>
					</label>
					<label>
					Support Password
					<input
						type="password"
						name="supportPassword"
						id="supportPassword"
						valueLink={ this.linkState( 'supportPassword' ) }
					/>
					</label>
					<button type="submit" className="button">
					Change to Support User
					</button>
				</form>
			</div>
			</Dialog>
		); }
	}
} );
