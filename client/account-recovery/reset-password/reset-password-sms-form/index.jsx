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
	submitValidationCode = ( event ) => {
		const {
			userData,
			selectedMethod,
			key,
		} = this.props;

		this.props.validateRequest( userData, selectedMethod, key );

		event.preventDefault();
	}

	render() {
		const {
			translate,
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
				<form onSubmit={ this.submitValidationCode }>
					<FormTextInput className="reset-password-sms-form__validation-code-input" />
					<FormButton className="reset-password-sms-form__submit-button" type="submit">
						{ translate( 'Continue' ) }
					</FormButton>
				</form>
				<a href="#" className="reset-password-sms-form__no-sms-link">
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
		key: getAccountRecoveryValidationKey( state ),
		isValidating: isValidatingAccountRecoveryKey( state ),
		error: getAccountRecoveryValidationError( state ),
	} ),
	{
		setValidationKey,
		validateRequest,
	}
)( localize( ResetPasswordSmsForm ) );
