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
import Notice from 'components/notice';

const SupportUserLoginDialog = React.createClass( {

	mixins: [ LinkedStateMixin ],

	getInitialState() {
		return {
			supportUser: '',
			supportPassword: ''
		};
	},

	onSubmit() {
		this.props.onChangeUser( this.state.supportUser, this.state.supportPassword );
		this.setState( { supportPassword: '' } );
	},

	onEnterKey( event ) {
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
	},

	onEscapeKey( event ) {
		event.preventDefault();
		this.props.onCloseDialog();
	},

	onInputKeyDown( event ) {
		switch ( event.key ) {
			case 'Enter':
				return this.onEnterKey( event );
			case 'Escape':
				return this.onEscapeKey( event );
		}
	},

	componentDidUpdate( prevProps ) {
		if ( ! this.props.isBusy && prevProps.isBusy ) {
			setTimeout( () => this.supportPasswordInput.focus(), 0 );
		}
	},

	render() {
		const { isVisible, isBusy, onCloseDialog, errorMessage } = this.props;

		const buttons = [
			<FormButton
				key="supportuser"
				disabled={ isBusy }
				onClick={ this.onSubmit }>
					{ isBusy ? 'Switching...' : 'Change user' }
			</FormButton>,
			<FormButton
				key="cancel"
				type="button"
				isPrimary={ false }
				onClick={ onCloseDialog }>
					Cancel
			</FormButton>
		];

		const supportPasswordRef = ( ref ) => this.supportPasswordInput = ref;

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ onCloseDialog }
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
							autoFocus={ true }
							disabled={ isBusy }
							name="supportUser"
							id="supportUser"
							placeholder="Username"
							onKeyDown={ this.onInputKeyDown }
							valueLink={ this.linkState( 'supportUser' ) } />
					</FormLabel>

					<FormLabel>
						<span>Support user password</span>
						<FormPasswordInput
							name="supportPassword"
							id="supportPassword"
							disabled={ isBusy }
							placeholder="Password"
							ref={ supportPasswordRef }
							onKeyDown={ this.onInputKeyDown }
							valueLink={ this.linkState( 'supportPassword' ) } />
					</FormLabel>
				</FormFieldset>
			</Dialog>
		);
	},
} );

export default SupportUserLoginDialog;
