/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import ErrorMessage from 'account-recovery/components/account-recovery-error-message';

import {
	getAccountRecoveryResetUserData,
	getAccountRecoveryResetSelectedMethod,
	getAccountRecoveryValidationError,
	getAccountRecoveryValidationKey,
	isValidatingAccountRecoveryKey,
} from 'state/selectors';

import {
	setValidationKey,
	validateRequest,
} from 'state/account-recovery/reset/actions';

class ResetPasswordSmsForm extends Component {
	submitValidationKey = ( event ) => {
		const {
			userData,
			selectedMethod,
			validationKey,
		} = this.props;

		this.props.validateRequest( userData, selectedMethod, validationKey );

		event.preventDefault();
	}

	updateValidationKey = ( event ) => {
		this.props.setValidationKey( event.target.value );
	}

	render() {
		const {
			translate,
			isValidating,
			error,
			validationKey,
		} = this.props;

		return (
			<Card>
				<h2 className="reset-password-sms-form__title">
					{ translate( 'Reset your password' ) }
				</h2>
				<p>
					{ translate( 'Please enter the code you were sent by SMS. ' +
						'It will look something like {{code}}63423423{{/code}}. You may need to wait a few moments before it arrives.',
						{ components: { code: <code /> } } )
					}
				</p>
				<form onSubmit={ this.submitValidationKey }>
					<FormTextInput
						className="reset-password-sms-form__validation-code-input"
						disabled={ isValidating }
						value={ validationKey || '' }
						onChange={ this.updateValidationKey }
					/>
					{ error && <ErrorMessage /> }
					<FormButton className="reset-password-sms-form__submit-button" type="submit" disabled={ isValidating } >
						{ translate( 'Continue' ) }
					</FormButton>
				</form>
				<a href="/account-recovery/reset-password/" className="reset-password-sms-form__no-sms-link">
					{ translate( 'No SMS?' ) }
				</a>
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		userData: getAccountRecoveryResetUserData( state ),
		selectedMethod: getAccountRecoveryResetSelectedMethod( state ),
		validationKey: getAccountRecoveryValidationKey( state ),
		isValidating: isValidatingAccountRecoveryKey( state ),
		error: getAccountRecoveryValidationError( state ),
	} ),
	{
		setValidationKey,
		validateRequest,
	}
)( localize( ResetPasswordSmsForm ) );
