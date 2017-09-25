/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ErrorMessage from 'account-recovery/components/account-recovery-error-message';
import Button from 'components/button';
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';
import { setValidationKey, validateRequest, clearResetMethod } from 'state/account-recovery/reset/actions';
import { getAccountRecoveryResetUserData, getAccountRecoveryResetSelectedMethod, getAccountRecoveryValidationError, isValidatingAccountRecoveryKey } from 'state/selectors';

class ResetPasswordSmsForm extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			candidateKey: '',
		};
	}

	submitValidationKey = ( event ) => {
		const {
			userData,
			selectedMethod,
		} = this.props;

		this.props.validateRequest( userData, selectedMethod, this.state.candidateKey );

		event.preventDefault();
	}

	updateValidationKey = ( event ) => {
		this.setState( { candidateKey: event.target.value } );
	}

	render() {
		const {
			translate,
			isValidating,
			error,
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
						value={ this.state.candidateKey }
						onChange={ this.updateValidationKey }
						autoFocus
					/>
					{ error && <ErrorMessage error={ error } /> }
					<FormButton className="reset-password-sms-form__submit-button" type="submit" disabled={ isValidating } >
						{ translate( 'Continue' ) }
					</FormButton>
				</form>
				<Button className="reset-password-sms-form__no-sms-link" onClick={ this.props.clearResetMethod } borderless>
					{ translate( 'No SMS?' ) }
				</Button>
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
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
