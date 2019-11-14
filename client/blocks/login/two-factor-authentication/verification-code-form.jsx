/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { defer } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormVerificationCodeInput from 'components/forms/form-verification-code-input';
import { localize } from 'i18n-calypso';
import { getTwoFactorAuthRequestError } from 'state/login/selectors';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import {
	formUpdate,
	loginUserWithTwoFactorVerificationCode,
	sendSmsCode,
} from 'state/login/actions';
import TwoFactorActions from './two-factor-actions';

/**
 * Style dependencies
 */
import './verification-code-form.scss';

class VerificationCodeForm extends Component {
	static propTypes = {
		formUpdate: PropTypes.func.isRequired,
		isJetpack: PropTypes.bool,
		loginUserWithTwoFactorVerificationCode: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthRequestError: PropTypes.object,
		twoFactorAuthType: PropTypes.string.isRequired,
	};

	state = {
		twoStepCode: '',
		isDisabled: true,
	};

	componentDidMount() {
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( { isDisabled: false }, () => {
			this.input.focus();
		} );
	}

	componentDidUpdate( prevProps ) {
		const { twoFactorAuthRequestError, twoFactorAuthType } = this.props;

		const hasNewError = ! prevProps.twoFactorAuthRequestError && twoFactorAuthRequestError;
		const isNewPage = prevProps.twoFactorAuthType !== twoFactorAuthType;

		if ( isNewPage || ( hasNewError && twoFactorAuthRequestError.field === 'twoStepCode' ) ) {
			defer( () => this.input.focus() );
		}
	}

	UNSAFE_componentWillReceiveProps = nextProps => {
		// Resets the verification code input field when switching pages
		if ( this.props.twoFactorAuthType !== nextProps.twoFactorAuthType ) {
			this.setState( { twoStepCode: '' } );
		}
	};

	onChangeField = event => {
		const { name, value = '' } = event.target;

		this.props.formUpdate();

		this.setState( { [ name ]: value } );
	};

	onSubmitForm = event => {
		event.preventDefault();

		const { onSuccess, twoFactorAuthType } = this.props;
		const { twoStepCode } = this.state;

		this.props.recordTracksEvent( 'calypso_login_two_factor_verification_code_submit' );

		this.setState( { isDisabled: true } );

		this.props
			.loginUserWithTwoFactorVerificationCode( twoStepCode, twoFactorAuthType )
			.then( () => {
				this.props.recordTracksEvent( 'calypso_login_two_factor_verification_code_success' );

				onSuccess();
			} )
			.catch( error => {
				this.setState( { isDisabled: false } );

				this.props.recordTracksEvent( 'calypso_login_two_factor_verification_code_failure', {
					error_code: error.code,
					error_message: error.message,
				} );
			} );
	};

	saveRef = input => {
		this.input = input;
	};

	render() {
		const {
			isJetpack,
			translate,
			twoFactorAuthRequestError: requestError,
			twoFactorAuthType,
		} = this.props;

		let helpText = translate( 'Enter the code generated by your authenticator app.' );
		let labelText = translate( 'Verification code' );
		let smallPrint;

		if ( twoFactorAuthType === 'sms' ) {
			helpText = translate( 'Enter the code from the text message we sent you.' );
		}

		if ( twoFactorAuthType === 'backup' ) {
			helpText = translate(
				"If you can't access your phone enter one of the 10 backup codes that were provided " +
					'when you set up two-step authentication to continue.'
			);
			labelText = translate( 'Backup code' );
			smallPrint = (
				<div className="two-factor-authentication__small-print">
					{ translate(
						'If you lose your device, accidentally remove the authenticator app, or are otherwise ' +
							'locked out of your account, the only way to get back in to your account is by using a backup code.'
					) }
				</div>
			);
		}

		return (
			<form onSubmit={ this.onSubmitForm }>
				<Card compact className="two-factor-authentication__verification-code-form">
					<p>{ helpText }</p>

					<FormFieldset>
						<FormLabel htmlFor="twoStepCode">{ labelText }</FormLabel>
						{ /* The use of `autoFocus` is intentional in this step. */ }
						<FormVerificationCodeInput
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							value={ this.state.twoStepCode }
							onChange={ this.onChangeField }
							isError={ requestError && requestError.field === 'twoStepCode' }
							name="twoStepCode"
							method={ twoFactorAuthType }
							ref={ this.saveRef }
							disabled={ this.state.isDisabled }
						/>
						{ requestError && requestError.field === 'twoStepCode' && (
							<FormInputValidation isError text={ requestError.message } />
						) }
					</FormFieldset>

					<FormButton primary disabled={ this.state.isDisabled }>
						{ translate( 'Continue' ) }
					</FormButton>

					{ smallPrint }
				</Card>

				<TwoFactorActions twoFactorAuthType={ twoFactorAuthType } isJetpack={ isJetpack } />
			</form>
		);
	}
}

export default connect(
	state => ( {
		twoFactorAuthRequestError: getTwoFactorAuthRequestError( state ),
	} ),
	{
		formUpdate,
		loginUserWithTwoFactorVerificationCode,
		recordTracksEvent,
		sendSmsCode,
	}
)( localize( VerificationCodeForm ) );
