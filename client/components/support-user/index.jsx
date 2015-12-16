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
			supportPassword: null,
			isSupportUser: false,
			showDialog: false,
			errorMessage: null,
			user: null
		};
	},

	isEnabled: function() {
		if ( this.state.isSupportUser ) {
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
				supportUser: null,
				supportPassword: null,
				isSupportUser: false,
				showDialog: true,
				errorMessage: error.message,
				user: null
		} );
	},

	onChangeUser: function( e ) {
		e.preventDefault();

		let user = new User();
		let myUser = Object.assign( {}, user.data );
		this.setState( { user: myUser } );

		if ( this.state.supportUser && this.state.supportPassword ) {
			user.clear();
			user.changeUser(
				this.state.supportUser,
				this.state.supportPassword,
				( error ) => this.onTokenError( error )
			);
			this.setState( { isSupportUser: true } );
			this.setState( { supportPassword: null } );
		}

		this.setState( { showDialog: false } );
		this.setState( { errorMessage: null } );
	},

	onRestoreUser: function( e ) {
		e.preventDefault();

		if ( this.state.isSupportUser ) {
			let user = new User();
			user.clear().fetch();
			this.setState( {
				supportUser: null,
				supportPassword: null,
				isSupportUser: false,
				showDialog: false,
				errorMessage: null,
				user: null
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
				<FormFieldset>
				<div className="support-user__people-profile">
					<div className="support-user__gravatar">
						<Gravatar user={ this.state.user } size={ 96 } />
					</div>
					<div className="support-user__detail">
						<div className="support-user__username">
							{ this.state.user.display_name }
						</div>
						<div className="support-user__login">
							<span>@{ this.state.user.username }</span>
						</div>
					</div>
				</div>
				</FormFieldset>
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
				{ this.state.errorMessage &&
					<h3 className="support-user__error">{ this.state.errorMessage }</h3>
				}
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
