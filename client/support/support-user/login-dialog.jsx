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
		}
	},

	onChangeUser() {
		this.props.onChangeUser( this.state.supportUser, this.state.supportPassword );
		this.setState( { supportPassword: '' } );
	},

	render() {
		const { isVisible, isBusy, onCloseDialog, errorMessage } = this.props;

		const buttons = [
			<FormButton
				key="supportuser"
				disabled={ isBusy }
				onClick={ this.onChangeUser }>
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

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ onCloseDialog }
				buttons={ buttons }
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
} );

export default SupportUserLoginDialog;
