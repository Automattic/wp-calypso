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
	getTwoFactorAuthRequestError,
	isRequestingTwoFactorAuth,
} from 'state/login/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { sendSmsCode } from 'state/login/actions';
import TwoFactorActions from './two-factor-actions';

class VerificationCodeForm extends Component {
	static propTypes = {
		loginUserWithTwoFactorVerificationCode: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		rememberMe: PropTypes.bool.isRequired,
		isSmsSupported: PropTypes.bool,
		twoStepNonce: PropTypes.string.isRequired,
		userId: PropTypes.number.isRequired,
	};

	state = {
		twoStepCode: ''
	};

	componentWillMount() {
		this.maybeSendSmsCode( this.props );
	}

	maybeSendSmsCode( props ) {
		if ( props.twoFactorAuthType !== 'sms' ) {
			return;
		}

		props.sendSmsCode();
	}

	componentWillReceiveProps = ( nextProps ) => {
		const hasError = this.props.twoFactorAuthRequestError !== nextProps.twoFactorAuthRequestError;
		const isNewPage = this.props.twoFactorAuthType !== nextProps.twoFactorAuthType;

		if ( isNewPage ) {
			// Resets the code input value when changing pages
			this.setState( { twoStepCode: '' } );

			this.maybeSendSmsCode( nextProps );
		}

		if ( ( isNewPage || hasError ) && ( this.input !== null ) ) {
			this.input.focus();
		}
	};

	onChangeField = ( event ) => {
		this.setState( {
			[ event.target.name ]: event.target.value,
		} );
	};

	onCodeSubmit = ( event ) => {
		event.preventDefault();

		const { rememberMe } = this.props;
		const { twoStepCode } = this.state;

		this.props.loginUserWithTwoFactorVerificationCode( twoStepCode, rememberMe ).then( () => {
			this.props.onSuccess();
		} ).catch( ( errorMessage ) => {
			this.props.recordTracksEvent( 'calypso_two_factor_verification_code_failure', {
				error_message: errorMessage
			} );
		} );
	};

	saveRef = ( input ) => {
		this.input = input;
	};

	render() {
		const {
			translate,
			twoFactorAuthRequestError,
			twoFactorAuthType,
		} = this.props;
		const isError = !! twoFactorAuthRequestError;

		let helpText = translate( 'Type in the code generated by your Authenticator mobile application.' );
		let labelText = translate( 'Verification code' );
		let smallPrint;

		if ( twoFactorAuthType === 'sms' ) {
			helpText = translate( 'Type in the code you receive in a text message.' );
		}

		if ( twoFactorAuthType === 'backup' ) {
			helpText = translate( "If you can't access your phone enter one of the 10 backup codes that were provided " +
				'when you set up two-step authentication to continue.' );
			labelText = translate( 'Backup code' );
			smallPrint = (
				<div className="two-factor-authentication__small-print">
					{ translate( 'If you lose your device, accidentally remove the authenticator app, or are otherwise ' +
						'locked out of your account, the only way to get back in to your account is by using a backup code.' ) }
				</div>
			);
		}

		return (
			<form onSubmit={ this.onCodeSubmit }>
				<Card className="two-factor-authentication__push-notification-screen is-compact">
					<p>
						{ helpText }
					</p>

					<FormFieldset>
						<FormLabel htmlFor="twoStepCode">
							{ labelText }
						</FormLabel>

						<FormTextInput
							autoComplete="off"
							autoFocus
							value={ this.state.twoStepCode }
							onChange={ this.onChangeField }
							className={ classNames( { 'is-error': isError } ) }
							name="twoStepCode"
							pattern="[0-9]*"
							ref={ this.saveRef }
							type="tel" />

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

					{ smallPrint }
				</Card>

				<TwoFactorActions twoFactorAuthType={ twoFactorAuthType } />
			</form>
		);
	}
}

export default connect(
	( state ) => ( {
		isRequestingTwoFactorAuth: isRequestingTwoFactorAuth( state ),
		twoFactorAuthRequestError: getTwoFactorAuthRequestError( state ),
	} ),
	{
		loginUserWithTwoFactorVerificationCode,
		recordTracksEvent,
		sendSmsCode
	}
)( localize( VerificationCodeForm ) );
