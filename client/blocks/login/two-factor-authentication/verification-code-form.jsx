/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import FormButtonsBar from 'components/forms/form-buttons-bar';
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

class VerificationCodeForm extends Component {
	static propTypes = {
		loginUserWithTwoFactorVerificationCode: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		rememberMe: PropTypes.bool.isRequired,
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
		const { translate, twoFactorAuthRequestError } = this.props;
		const isError = !! twoFactorAuthRequestError;

		return (
			<div>
				<div className="two-factor-authentication__header">
					{ translate( '2-Step Verification' ) }
				</div>

				<form onSubmit={ this.onCodeSubmit }>
					<Card>
						<p>
							{ translate( 'Please enter the verification code generated' +
								' by your Authenticator mobile application.' ) }
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

						<FormButtonsBar>
							<FormButton
								onClick={ this.onSubmit }
								primary
								disabled={ this.props.isRequestingTwoFactorAuth }
							>{ translate( 'Log in' ) }</FormButton>
						</FormButtonsBar>
					</Card>
				</form>

				<p>
					<ExternalLink
						icon={ true }
						target="_blank"
						href="http://en.support.wordpress.com/security/two-step-authentication/">
						{ translate( 'Help' ) }
					</ExternalLink>
				</p>

				<hr />

				<p>
					<a href="#" onClick={ this.sendSmsCode }>{ translate( 'Send recovery code via text' ) }</a>
				</p>
			</div>
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
	}
)( localize( VerificationCodeForm ) );
