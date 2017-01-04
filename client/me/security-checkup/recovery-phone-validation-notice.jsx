/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTelInput from 'components/forms/form-tel-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormButton from 'components/forms/form-button';

class RecoveryPhoneValidationNotice extends Component {
	onSubmit( event ) {
		event.preventDefault();
	}

	onResend = ( event ) => {
		event.preventDefault();

		this.props.onResend();
	}

	onValidate = ( event ) => {
		event.preventDefault();

		this.props.onValidate( 1234567 );
	}

	render() {
		const {
			translate,
		} = this.props;

		return (
			<form onSubmit={ this.onSubmit }>
				<FormTelInput
					autoComplete="off"
					disabled={ false }
					name="verification-code"
					placeholder={ 'e.g. 1234567' }
				/>
				<FormSettingExplanation>
					{ translate( 'A code has been sent to your device via SMS. ' +
						'Please check you phone.' ) }
				</FormSettingExplanation>
				<FormButtonsBar>
					<FormButton
						isPrimary={ true }
						onClick={ this.onValidate }
					>
						{ translate( 'Validate' ) }
					</FormButton>
					<FormButton
						isPrimary={ false }
						onClick={ this.onResend }
					>
						{ translate( 'Resend' ) }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	}
}

export default localize( RecoveryPhoneValidationNotice );
