/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTelInput from 'components/forms/form-tel-input';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormButton from 'components/forms/form-button';
import Notice from 'components/notice';

class RecoveryPhoneValidationNotice extends Component {
	constructor() {
		super();

		this.state = {
			candidateCode: '',
		};
	}

	onSubmit( event ) {
		event.preventDefault();
	}

	onResend = ( event ) => {
		event.preventDefault();

		this.props.onResend();
	}

	onValidate = ( event ) => {
		event.preventDefault();

		this.props.onValidate( this.state.candidateCode );
	}

	onChange = ( event ) => {
		event.preventDefault();

		this.setState( {
			candidateCode: event.target.value,
		} );
	}

	render() {
		const {
			translate,
			isValidating,
			hasSent,
		} = this.props;

		const validationCodeLength = 8;
		const validateButtonText = isValidating ? translate( 'Validating' ) : translate( 'Validate' );
		const resendButtonText = hasSent ? translate( 'Sent' ) : translate( 'Resend' );

		return (
			<form onSubmit={ this.onSubmit }>
				<Notice
					status="is-warning"
					text={ translate( 'Please validate your recovery SMS number. Check your phone for a validation code.' ) }
					showDismiss={ false }
				/>
				<FormTelInput
					autoComplete="off"
					disabled={ false }
					placeholder={ translate( 'e.g. 12345678' ) }
					onChange={ this.onChange }
					value={ this.state.candidateCode }
				/>
				<FormButtonsBar className="security-checkup__recovery-phone-validation-buttons">
					<FormButton
						isPrimary={ true }
						disabled={ isValidating || validationCodeLength !== this.state.candidateCode.length }
						onClick={ this.onValidate }
					>
						{ validateButtonText }
					</FormButton>
					<FormButton
						isPrimary={ false }
						disabled={ this.props.hasSent }
						onClick={ this.onResend }
					>
						{ resendButtonText }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	}
}

export default localize( RecoveryPhoneValidationNotice );
