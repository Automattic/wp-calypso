/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import ErrorMessage from 'account-recovery/components/account-recovery-error-message';
import getAccountRecoveryResetSelectedMethod from 'state/selectors/get-account-recovery-reset-selected-method';
import getAccountRecoveryResetUserData from 'state/selectors/get-account-recovery-reset-user-data';
import getAccountRecoveryValidationError from 'state/selectors/get-account-recovery-validation-error';
import isValidatingAccountRecoveryKey from 'state/selectors/is-validating-account-recovery-key';

import {
	setValidationKey,
	validateRequest,
	clearResetMethod,
} from 'state/account-recovery/reset/actions';

class ResetPasswordSmsForm extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			candidateKey: '',
		};
	}

	submitValidationKey = event => {
		const { userData, selectedMethod } = this.props;

		this.props.validateRequest( userData, selectedMethod, this.state.candidateKey );

		event.preventDefault();
	};

	updateValidationKey = event => {
		this.setState( { candidateKey: event.target.value } );
	};

	render() {
		const { translate, isValidating, error } = this.props;

		return (
			<Card>
				<h2 className="reset-password-sms-form__title">{ translate( 'Reset your password' ) }</h2>
				<p>
					{ translate(
						'Please enter the code you were sent by SMS. ' +
						'It will look something like {{code}}%(code)s{{/code}}. You may need to wait a few moments before it arrives.',
						{
							args: { code: '6342 3423' },
							components: { code: <code /> },
						}
					) }
				</p>
				<form onSubmit={ this.submitValidationKey }>
					<FormTextInput
						className="reset-password-sms-form__validation-code-input"
						disabled={ isValidating }
						value={ this.state.candidateKey }
						onChange={ this.updateValidationKey }
					/>
					{ error && <ErrorMessage error={ error } /> }
					<FormButton
						className="reset-password-sms-form__submit-button"
						type="submit"
						disabled={ isValidating }
					>
						{ translate( 'Continue' ) }
					</FormButton>
				</form>
				<Button
					className="reset-password-sms-form__no-sms-link"
					onClick={ this.props.clearResetMethod }
					borderless
				>
					{ translate( 'No SMS?' ) }
				</Button>
			</Card>
		);
	}
}

export default connect(
	state => ( {
		userData: getAccountRecoveryResetUserData( state ),
		selectedMethod: getAccountRecoveryResetSelectedMethod( state ),
		isValidating: isValidatingAccountRecoveryKey( state ),
		error: getAccountRecoveryValidationError( state ),
	} ),
	{
		setValidationKey,
		validateRequest,
		clearResetMethod,
	}
)( localize( ResetPasswordSmsForm ) );
