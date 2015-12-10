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
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import Gravatar from 'components/gravatar';

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
		this.setState( { showDialog: false } );
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

	getButtonsSupportUser: function() {
		var buttons;

		buttons = [
			<FormButton
				key="supportuser"
				onClick={ this.onChangeUser }>
					Change user
			</FormButton>,
			<FormButton
				key="cancel"
				isPrimary={ false }
				onClick={ this.closeDialog }>
					Cancel
			</FormButton>
		];

		return buttons;
	},

	getButtonsRestoreUser: function() {
		var buttons;

		buttons = [
			<FormButton
				key="restoreuser"
				onClick={ this.onRestoreUser }>
					Restore user
			</FormButton>,
			<FormButton
				key="cancel"
				isPrimary={ false }
				onClick={ this.closeDialog }>
					Cancel
			</FormButton>
		];

		return buttons;
	},

	render: function() {
		if ( this.state.isSupportUser ) {
		return (
			<Dialog 
				isVisible={ this.state.showDialog }
				onClose={ this.closeDialog }
				buttons={ this.getButtonsRestoreUser() }
				additionalClassNames="support-user__dialog" 
			>
				<div className="support-user__people-profile">
					<div className="support-user__gravatar">
						<img className="gravatar" src="https://0.gravatar.com/avatar/3c063e69ebd9a94b87a36749505b5561?s=96&d=mm&r=G" />
					</div>
					<div className="support-user__detail">
						<div className="support-user__username">
							Eduardo Villuendas
						</div>
						<div className="support-user__login">
							<span>@evilluendas</span>
						</div>
					</div>
				</div>
			</Dialog>
		);
		} else {
		return (
			<Dialog 
				isVisible={ this.state.showDialog } 
				onClose={ this.closeDialog }
				buttons={ this.getButtonsSupportUser() }
				additionalClassNames="support-user__dialog" 
			>
				<h2 className="support-user__heading">Support user</h2>
				<FormFieldset>
					<FormLabel>
						<span>Username</span>
						<FormTextInput
							name="supportUser"
							id="supportUser"
							valueLink={ this.linkState( 'supportUser' ) }
						/>
					</FormLabel>

					<FormLabel>
						<span>User support password</span>
						<FormPasswordInput
							name="supportPassword"
							id="supportPassword"
							valueLink={ this.linkState( 'supportPassword' ) }
						/>
					</FormLabel>
				</FormFieldset>
			</Dialog>
		); }
	}
} );
