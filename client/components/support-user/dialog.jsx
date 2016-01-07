/**
 * External Dependencies
 */
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

/**
 * Internal Dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import Gravatar from 'components/gravatar';

const SupportUserDialog = React.createClass( {

	mixins: [ LinkedStateMixin ],

	getInitialState() {
		return {
			supportUser: '',
			supportPassword: ''
		}
	},

	onChangeUser() {
		this.props.onChangeUser( this.state.supportUser, this.state.supportPassword );
	},

	getButtonsLoggedOut() {
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
				onClick={ this.props.closeDialog }>
					Cancel
			</FormButton>
		];

		return buttons;
	},

	getButtonsLoggedIn() {
		var buttons;

		buttons = [
			<FormButton
				key="restoreuser"
				onClick={ this.props.onRestoreUser }>
					Restore user
			</FormButton>,
			<FormButton
				key="cancel"
				isPrimary={ false }
				onClick={ this.props.closeDialog }>
					Cancel
			</FormButton>
		];

		return buttons;
	},

	/**
	 * The logged in dialog shows a button to log out (restore user)
	 */
	renderLoggedIn() {
		return (
			<Dialog
				isVisible={ this.props.isVisible }
				onClose={ this.onCloseDialog }
				buttons={ this.getButtonsLoggedIn() }
				additionalClassNames="support-user__dialog"
			>
				<FormFieldset>
				<div className="support-user__people-profile">
					<div className="support-user__gravatar">
						<Gravatar user={ this.props.user } size={ 96 } />
					</div>
					<div className="support-user__detail">
						<div className="support-user__username">
							{ this.props.user.display_name }
						</div>
						<div className="support-user__login">
							<span>@{ this.props.user.username }</span>
						</div>
					</div>
				</div>
				</FormFieldset>
			</Dialog>
		);
	},
	
	/**
	 * The logged out dialog shows a log in form
	 */
	renderLoggedOut() {
		return (
			<Dialog
				isVisible={ this.props.isVisible }
				onClose={ this.props.onCloseDialog }
				buttons={ this.getButtonsLoggedOut() }
				additionalClassNames="support-user__dialog">
				<h2 className="support-user__heading">Support user</h2>
				{ this.props.errorMessage &&
					<h3 className="support-user__error">{ this.props.errorMessage }</h3>
				}
				<FormFieldset>
					<FormLabel>
						<span>Username</span>
						<FormTextInput
							name="supportUser"
							id="supportUser"
							valueLink={ this.linkState( 'supportUser' ) } />
					</FormLabel>

					<FormLabel>
						<span>User support password</span>
						<FormPasswordInput
							name="supportPassword"
							id="supportPassword"
							valueLink={ this.linkState( 'supportPassword' ) } />
					</FormLabel>
				</FormFieldset>
			</Dialog>
		);
	},

	render() {
		return ( this.props.isLoggedIn ? this.renderLoggedIn() : this.renderLoggedOut() );
	}
} );

export default SupportUserDialog;
