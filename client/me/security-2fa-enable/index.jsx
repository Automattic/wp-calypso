import { FormLabel } from '@automattic/components';
import clsx from 'clsx';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { QRCodeSVG } from 'qrcode.react';
import { Component } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormVerificationCodeInput from 'calypso/components/forms/form-verification-code-input';
import Notice from 'calypso/components/notice';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import wp from 'calypso/lib/wp';
import OneTimeCode from 'calypso/me/security-2fa-enable/one-time-code';

import './style.scss';

const debug = debugFactory( 'calypso:me:security:2fa-enable' );

class Security2faEnable extends Component {
	static displayName = 'Security2faEnable';

	static defaultProps = {
		isSmsFlow: false,
	};

	static propTypes = {
		isSmsFlow: PropTypes.bool,
		onCancel: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
	};

	state = {
		lastError: false,
		lastErrorType: false,
		method: this.props.isSmsFlow ? 'sms' : 'scan',
		otpAuthUri: false,
		smsRequestsAllowed: true,
		smsRequestPerformed: false,
		submittingCode: false,
		oneTimeCode: false,
		verificationCode: '',
	};

	codeRequestTimer = false;

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );

		wp.req.get( '/me/two-step/app-auth-setup/', ( error, data ) => {
			if ( error ) {
				this.setState( {
					lastError: this.props.translate(
						'Unable to obtain authorization application setup information. Please try again later.'
					),
					lastErrorType: 'is-error',
				} );
				return;
			}

			this.setState( {
				otpAuthUri: data.otpauth_uri,
				oneTimeCode: data.time_code,
			} );
		} );

		if ( this.props.isSmsFlow ) {
			this.requestSMS();
		}
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
		this.cancelCodeRequestTimer();
	}

	allowSMSRequests = () => {
		this.setState( { smsRequestsAllowed: true } );
	};

	requestSMS = () => {
		this.setState( {
			smsRequestsAllowed: false,
			lastError: false,
		} );
		twoStepAuthorization.sendSMSCode( this.onSMSRequestResponse );
		this.codeRequestTimer = setTimeout( this.allowSMSRequests, 60000 );
	};

	onSMSRequestResponse = ( error ) => {
		if ( error ) {
			this.setState( {
				smsRequestPerformed: false,
				lastError: this.props.translate(
					'Unable to request a code via SMS right now. Please try again after one minute.'
				),
				lastErrorType: 'is-info',
			} );
		} else {
			this.setState( { smsRequestPerformed: true } );
		}
	};

	cancelCodeRequestTimer = () => {
		if ( this.codeRequestTimer ) {
			clearTimeout( this.codeRequestTimer );
		}
	};

	onResendCode = ( event ) => {
		event.preventDefault();
		if ( this.state.smsRequestsAllowed ) {
			this.requestSMS();
		}
	};

	getFormDisabled = () => {
		return this.state.submittingCode || 6 > this.state.verificationCode.trim().length;
	};

	onCodeSubmit = ( event ) => {
		event.preventDefault();
		this.setState( { submittingCode: true }, this.onBeginCodeValidation );
	};

	onBeginCodeValidation = () => {
		const args = {
			code: this.state.verificationCode,
			action: 'enable-two-step',
		};

		twoStepAuthorization.validateCode( args, this.onValidationResponseReceived );
	};

	onValidationResponseReceived = ( error, data ) => {
		this.setState( { submittingCode: false } );

		if ( error ) {
			this.setState( {
				lastError: this.props.translate( 'An unexpected error occurred. Please try again later.' ),
				lastErrorType: 'is-error',
			} );
		} else if ( ! data.success ) {
			this.setState( {
				lastError: this.props.translate( 'You entered an invalid code. Please try again.' ),
				lastErrorType: 'is-error',
			} );
		} else {
			this.props.onSuccess();
		}
	};

	renderQRCode = () => {
		const qrClasses = clsx( 'security-2fa-enable__qr-code', {
			'is-placeholder': ! this.state.otpAuthUri,
		} );

		return (
			<div className="security-2fa-enable__qr-code-block">
				<ol className="security-2fa-enable__steps">
					<li>
						{ this.props.translate(
							'Use your authenticator app to scan the QR code or enter this one time code:'
						) }
						<OneTimeCode oneTimeCode={ this.state.oneTimeCode } />
					</li>
					<li>{ this.renderInputBlock() }</li>
				</ol>
				<div className={ qrClasses }>
					{ this.state.otpAuthUri && <QRCodeSVG value={ this.state.otpAuthUri } size={ 150 } /> }
				</div>
			</div>
		);
	};

	renderCodeBlock = () => {
		if ( 'sms' === this.state.method ) {
			return null;
		}

		return <div className="security-2fa-enable__code-block">{ this.renderQRCode() }</div>;
	};

	renderInputHelp = () => {
		if ( 'sms' === this.state.method ) {
			return (
				<FormLabel htmlFor="verification-code">
					{ this.props.translate( 'Enter the code you receive via SMS:' ) }
				</FormLabel>
			);
		}

		return <p>{ this.props.translate( 'Enter the six digit code from the app.' ) }</p>;
	};

	clearLastError = () => {
		this.setState( { lastError: false, lastErrorType: false } );
	};

	possiblyRenderError = () => {
		if ( ! this.state.lastError ) {
			return null;
		}

		return (
			<Notice
				status={ this.state.lastErrorType }
				onDismissClick={ this.clearLastError }
				text={ this.state.lastError }
			/>
		);
	};

	renderSmsInputBlock = () => {
		return this.renderInputBlock(
			<FormSettingExplanation>
				{ this.props.translate(
					'A code has been sent to your device via SMS. ' +
						'You may request another code after one minute.'
				) }
			</FormSettingExplanation>
		);
	};

	renderInputBlock = ( children ) => {
		return (
			<div className="security-2fa-enable__next">
				{ this.renderInputHelp() }

				<FormVerificationCodeInput
					disabled={ this.state.submittingForm }
					name="verificationCode"
					method={ this.state.method }
					onFocus={ function () {
						gaRecordEvent( 'Me', 'Focused On 2fa Enable Verification Code Input' );
					} }
					value={ this.state.verificationCode }
					onChange={ this.handleChange }
				/>

				{ children }

				{ this.possiblyRenderError() }
			</div>
		);
	};

	renderButtons = () => {
		return (
			<div className="security-2fa-enable__buttons-bar">
				<FormButton
					type="button"
					className="security-2fa-enable__cancel"
					isPrimary={ false }
					onClick={ ( event ) => {
						gaRecordEvent(
							'Me',
							'Clicked On Step 2 Cancel 2fa Button',
							'method',
							this.state.method
						);
						this.props.onCancel( event );
					} }
				>
					{ this.props.translate( 'Cancel' ) }
				</FormButton>

				{ 'sms' === this.state.method && (
					<FormButton
						type="button"
						className="security-2fa-enable__resend"
						disabled={ ! this.state.smsRequestsAllowed }
						isPrimary={ false }
						onClick={ ( event ) => {
							gaRecordEvent( 'Me', 'Clicked On Resend SMS Button' );
							this.onResendCode( event );
						} }
					>
						{ this.props.translate( 'Resend Code', {
							context: 'A button label to let a user get the SMS code sent again.',
						} ) }
					</FormButton>
				) }

				<FormButton
					className="security-2fa-enable__verify"
					disabled={ this.getFormDisabled() }
					onClick={ () => {
						gaRecordEvent( 'Me', 'Clicked On Enable 2fa Button', 'method', this.state.method );
					} }
				>
					{ this.state.submittingCode
						? this.props.translate( 'Enabling…', {
								context: 'A button label used during Two-Step setup.',
						  } )
						: this.props.translate( 'Enable', {
								context: 'A button label used during Two-Step setup.',
						  } ) }
				</FormButton>
			</div>
		);
	};

	render() {
		return (
			<div>
				<form className="security-2fa-enable" onSubmit={ this.onCodeSubmit }>
					{ this.state.method === 'sms' ? (
						this.renderSmsInputBlock()
					) : (
						<div className="security-2fa-enable__inner">{ this.renderCodeBlock() }</div>
					) }
					{ this.renderButtons() }
				</form>
			</div>
		);
	}

	handleChange = ( e ) => {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	};
}

export default localize( Security2faEnable );
