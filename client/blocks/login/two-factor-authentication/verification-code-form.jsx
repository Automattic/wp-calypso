/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import { loginUserWithTwoFactorVerificationCode } from 'state/login/actions';
import {
	getTwoFactorUserId,
	getTwoFactorAuthNonce,
	getTwoFactorAuthRequestError,
	isRequestingTwoFactorAuth,
} from 'state/login/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { sendSmsCode } from 'state/login/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import TwoFactorActions from './two-factor-actions';

class VerificationCodeForm extends Component {
	static propTypes = {
		errorNotice: PropTypes.func.isRequired,
		loginUserWithTwoFactorVerificationCode: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		rememberMe: PropTypes.bool.isRequired,
		successNotice: PropTypes.func.isRequired,
		isSmsSupported: PropTypes.bool,
		twoStepNonce: PropTypes.string.isRequired,
		userId: PropTypes.number.isRequired,
	};

	state = {
		twoStepCode: ''
	};

	onChangeField = ( event ) => {
		this.setState( {
			[ event.target.name ]: event.target.value,
		} );
	};

	onCodeSubmit = ( event ) => {
		event.preventDefault();

		const { userId, twoStepNonce, rememberMe } = this.props;
		const { twoStepCode } = this.state;

		this.props.loginUserWithTwoFactorVerificationCode( userId, twoStepCode, twoStepNonce, rememberMe ).then( () => {
			this.props.onSuccess();
		} ).catch( ( errorMessage ) => {
			this.props.recordTracksEvent( 'calypso_two_factor_verification_code_failure', {
				error_message: errorMessage
			} );
		} );
	};

	render() {
		const {
			translate,
			twoFactorAuthRequestError,
			twoFactorAuthType,
		} = this.props;
		const isError = !! twoFactorAuthRequestError;

		let helpText = translate( 'Type in the code generated by your Authenticator mobile application.' );
		if ( twoFactorAuthType === 'sms' ) {
			helpText = translate( 'A text message with the verification code was just sent to your phone number.' );
		}

		return (
			<form onSubmit={ this.onCodeSubmit }>
				<Card className="two-factor-authentication__push-notification-screen is-compact">
					<p>
						{ helpText }
					</p>

					<FormFieldset>
						<FormLabel htmlFor="twoStepCode">
							{ translate( 'Verification Code' ) }
						</FormLabel>

						<FormTextInput
							onChange={ this.onChangeField }
							className={ classNames( { 'is-error': isError } ) }
							name="twoStepCode" />

						{ isError && (
							<FormInputValidation isError text={ twoFactorAuthRequestError } />
						) }
					</FormFieldset>

					<FormButton
						className="two-factor-authentication__form-button"
						onClick={ this.onSubmit }
						primary
						disabled={ this.props.isRequestingTwoFactorAuth }
					>{ translate( 'Continue' ) }</FormButton>
				</Card>

				<TwoFactorActions
					errorNotice={ this.props.errorNotice }
					successNotice={ this.props.successNotice }
					twoFactorAuthType={ twoFactorAuthType } />
			</form>
		);
	}
}

export default connect(
	( state ) => ( {
		isRequestingTwoFactorAuth: isRequestingTwoFactorAuth( state ),
		twoFactorAuthRequestError: getTwoFactorAuthRequestError( state ),
		userId: getTwoFactorUserId( state ),
		twoStepNonce: getTwoFactorAuthNonce( state ),
	} ),
	{
		loginUserWithTwoFactorVerificationCode,
		recordTracksEvent,
		sendSmsCode,
		errorNotice,
		successNotice,
	}
)( localize( VerificationCodeForm ) );
