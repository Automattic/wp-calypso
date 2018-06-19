/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormLabel from 'components/forms/form-label';
import FormVerificationCodeInput from 'components/forms/form-verification-code-input';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

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

	onValidate = event => {
		event.preventDefault();

		this.props.onValidate( this.state.candidateCode );
	};

	onChange = event => {
		event.preventDefault();

		this.setState( {
			candidateCode: event.target.value,
		} );
	};

	render() {
		const { translate, isValidating, hasSent } = this.props;

		const { candidateCode } = this.state;

		const validateButtonText = isValidating ? translate( 'Validating' ) : translate( 'Validate' );

		return (
			<form onSubmit={ this.onSubmit }>
				<Notice
					className="security-account-recovery__validation-notice"
					status="is-warning"
					text={ translate(
						'Please validate your recovery SMS number. Check your phone for a validation code.'
					) }
					showDismiss={ false }
				>
					{ ! hasSent && (
						<NoticeAction href="#" onClick={ this.props.onResend }>
							{ translate( 'Resend' ) }
						</NoticeAction>
					) }
				</Notice>

				<FormLabel className="security-account-recovery__recovery-phone-validation-label">
					{ translate( 'Enter the code you receive via SMS:' ) }
				</FormLabel>

				<FormVerificationCodeInput
					disabled={ isValidating }
					method={ 'sms' }
					onChange={ this.onChange }
					value={ candidateCode }
				/>

				<FormButtonsBar className="security-account-recovery__recovery-phone-validation-buttons">
					<FormButton isPrimary={ true } disabled={ isValidating } onClick={ this.onValidate }>
						{ validateButtonText }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	}
}

export default localize( RecoveryPhoneValidationNotice );
