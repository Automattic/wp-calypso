/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import Notice from 'components/notice';

class SupportUserLoginDialog extends Component {
	constructor( ...args ) {
		super( ...args );

		// Keep password in component state - we don't want it in global state
		this.state = { password: '' };
	}

	onSubmit = () => {
		// Can't submit without a username or password
		if ( ! this.props.username || ! this.state.password ) {
			return;
		}

		this.props.onChangeUser( this.props.username, this.state.password );
		this.setState( { password: '' } );
	}

	onCancel = () => {
		this.setState( { password: '' } );
		this.props.toggleDialog();
	}

	onInputKeyDown = ( event ) => {
		if ( event.key === 'Enter' ) {
			event.preventDefault();

			// Next action depends on which text field is active
			switch ( event.target.name ) {
				case 'supportUser':
					this.supportPasswordInput.focus();
					break;
				case 'supportPassword':
					this.onSubmit();
					break;
			}
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! this.props.isBusy && prevProps.isBusy ) {
			setTimeout( () => {
				this.supportPasswordInput.focus()
			}, 0 );
		}
	}

	onEditUsername = ( event ) => {
		this.props.setUsername( get( event, 'target.value', '' ) );
	}

	onEditPassword = ( event ) => {
		this.setState( {
			password: get( event, 'target.value', '' )
		} );
	}

	autoFocusField() {
		if ( this.props.username ) {
			// Autofocus the password only if username is already entered
			return 'password';
		}
		return 'username';
	}

	render() {
		const { isVisible, isBusy, errorMessage, username } = this.props;
		const { password } = this.state;

		const buttons = [
			<FormButton
				key="supportuser"
				disabled={ isBusy || ! username || ! password }
				onClick={ this.onSubmit }>
					{ isBusy ? 'Switching...' : 'Change user' }
			</FormButton>,
			<FormButton
				key="cancel"
				type="button"
				isPrimary={ false }
				onClick={ this.onCancel }>
					Cancel
			</FormButton>
		];

		const supportPasswordRef = ( ref ) => this.supportPasswordInput = ref;

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ this.onCancel }
				buttons={ buttons }
				autoFocus={ false }
				additionalClassNames="support-user__login-dialog">
				<h2 className="support-user__heading">Support user</h2>
				{ errorMessage &&
					<Notice
						status="is-error"
						text={ errorMessage }
						showDismiss={ false }
					/>
				}
				<FormFieldset>
					<FormLabel>
						<span>Username</span>
						<FormTextInput
							autoFocus={ this.autoFocusField() === 'username' }
							disabled={ isBusy }
							name="supportUser"
							id="supportUser"
							placeholder="Username"
							onKeyDown={ this.onInputKeyDown }
							onChange={ this.onEditUsername }
							value={ username || '' } />
					</FormLabel>

					<FormLabel>
						<span>Support user password</span>
						<FormPasswordInput
							autoFocus={ this.autoFocusField() === 'password'  }
							name="supportPassword"
							id="supportPassword"
							disabled={ isBusy }
							placeholder="Password"
							ref={ supportPasswordRef }
							onKeyDown={ this.onInputKeyDown }
							onChange={ this.onEditPassword }
							value={ password }
						/>
					</FormLabel>
				</FormFieldset>
			</Dialog>
		);
	}
}

export default SupportUserLoginDialog;
