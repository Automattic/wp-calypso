/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import React from 'react';

const debug = debugFactory( 'calypso:me:security:2fa-enable' );

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormVerificationCodeInput from 'components/forms/form-verification-code-input';
import Notice from 'components/notice';
import Security2faProgress from 'me/security-2fa-progress';
import twoStepAuthorization from 'lib/two-step-authorization';

/**
 * Style dependencies
 */
import './style.scss';

class Security2faEnable extends React.Component {
	static displayName = 'Security2faEnable';

	static defaultProps = {
		doSMSFlow: false,
	};

	static propTypes = {
		doSMSFlow: PropTypes.bool,
		onCancel: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
	};

	state = {
		lastError: false,
		lastErrorType: false,
		method: this.props.doSMSFlow ? 'sms' : 'scan',
		otpAuthUri: false,
		smsRequestsAllowed: true,
		smsRequestPerformed: false,
		submittingCode: false,
		timeCode: false,
		verificationCode: '',
	};

	codeRequestTimer = false;

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
		twoStepAuthorization.getAppAuthCodes( this.onAppAuthCodesRequestResponse );
		if ( this.props.doSMSFlow ) {
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

	onRequestSMS = ( event ) => {
		event.preventDefault();
		this.requestSMS();
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

	onVerifyBySMS = ( event ) => {
		event.preventDefault();
		if ( this.state.smsRequestsAllowed ) {
			this.requestSMS();
		}
		this.setState( { method: 'sms' } );
	};

	onAppAuthCodesRequestResponse = ( error, data ) => {
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
			timeCode: data.time_code,
		} );
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

	getToggleLink = () => {
		return (
			<a
				className="security-2fa-enable__toggle"
				onClick={ function ( event ) {
					this.toggleMethod( event );
					gaRecordEvent(
						'Me',
						'Clicked On Barcode Toggle Link',
						'current-method',
						this.state.method
					);
				}.bind( this ) }
			/>
		);
	};

	renderQRCode = () => {
		const qrClasses = classNames( 'security-2fa-enable__qr-code', {
			'is-placeholder': ! this.state.otpAuthUri,
		} );

		return (
			<div className="security-2fa-enable__qr-code-block">
				<p className="security-2fa-enable__qr-instruction">
					{ this.props.translate(
						"Scan this QR code with your mobile app. {{toggleMethodLink}}Can't scan the code?{{/toggleMethodLink}}",
						{
							components: {
								toggleMethodLink: this.getToggleLink(),
							},
						}
					) }
				</p>
				<div className={ qrClasses }>
					{ this.state.otpAuthUri && <QRCode value={ this.state.otpAuthUri } size={ 150 } /> }
				</div>
			</div>
		);
	};

	renderTimeCode = () => {
		return (
			<div className="security-2fa-enable__time-code-block">
				<p className="security-2fa-enable__time-instruction">
					{ this.props.translate(
						'Enter this time code into your mobile app. {{toggleMethodLink}}Prefer to scan the code?{{/toggleMethodLink}}',
						{
							components: {
								toggleMethodLink: this.getToggleLink(),
							},
						}
					) }
				</p>
				<p className="security-2fa-enable__time-code">{ this.state.timeCode }</p>
			</div>
		);
	};

	renderCodeBlock = () => {
		if ( 'sms' === this.state.method ) {
			return null;
		}

		return (
			<div className="security-2fa-enable__code-block">
				{ 'scan' === this.state.method ? this.renderQRCode() : this.renderTimeCode() }
			</div>
		);
	};

	renderInputHelp = () => {
		if ( 'sms' === this.state.method ) {
			return (
				<FormLabel htmlFor="verification-code">
					{ this.props.translate( 'Enter the code you receive via SMS:' ) }
				</FormLabel>
			);
		}

		return <p>{ this.props.translate( 'Then enter the six digit code provided by the app:' ) }</p>;
	};

	toggleMethod = ( event ) => {
		event.preventDefault();
		this.setState( { method: 'scan' === this.state.method ? 'time' : 'scan' } );
	};

	renderInputOptions = () => {
		if ( 'sms' === this.state.method ) {
			return null;
		}

		return (
			<div className="security-2fa-enable__app-options">
				<p>
					{ this.props.translate(
						'Not sure what this screen means? You may need to download ' +
							'{{authyLink}}Authy{{/authyLink}} or ' +
							'{{googleAuthenticatorLink}}Google Authenticator{{/googleAuthenticatorLink}} ' +
							'for your phone.',
						{
							components: {
								authyLink: (
									<a
										href="https://www.authy.com/download/"
										target="_blank"
										rel="noopener noreferrer"
										onClick={ function () {
											gaRecordEvent( 'Me', 'Clicked On 2fa Download Authy App Link' );
										} }
									/>
								),
								googleAuthenticatorLink: (
									<a
										href="https://support.google.com/accounts/answer/1066447?hl=en"
										target="_blank"
										rel="noopener noreferrer"
										onClick={ function () {
											gaRecordEvent( 'Me', 'Clicked On 2fa Download Google Authenticator Link' );
										} }
									/>
								),
							},
						}
					) }
				</p>
			</div>
		);
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

	renderInputBlock = () => {
		return (
			<div className="security-2fa-enable__next">
				{ this.renderInputHelp() }

				<FormVerificationCodeInput
					autoFocus
					disabled={ this.state.submittingForm }
					name="verificationCode"
					method={ this.state.method }
					onFocus={ function () {
						gaRecordEvent( 'Me', 'Focused On 2fa Enable Verification Code Input' );
					} }
					value={ this.state.verificationCode }
					onChange={ this.handleChange }
				/>

				{ 'sms' === this.state.method && this.state.smsRequestPerformed ? (
					<FormSettingExplanation>
						{ this.props.translate(
							'A code has been sent to your device via SMS. ' +
								'You may request another code after one minute.'
						) }
					</FormSettingExplanation>
				) : null }

				{ this.possiblyRenderError() }

				{ this.renderInputOptions() }
			</div>
		);
	};

	renderButtons = () => {
		return (
			<FormButtonsBar className="security-2fa-enable__buttons-bar">
				<FormButton
					className="security-2fa-enable__verify"
					disabled={ this.getFormDisabled() }
					onClick={ function () {
						gaRecordEvent( 'Me', 'Clicked On Enable 2fa Button', 'method', this.state.method );
					}.bind( this ) }
				>
					{ this.state.submittingCode
						? this.props.translate( 'Enabling…', {
								context: 'A button label used during Two-Step setup.',
						  } )
						: this.props.translate( 'Enable', {
								context: 'A button label used during Two-Step setup.',
						  } ) }
				</FormButton>

				<FormButton
					className="security-2fa-enable__cancel"
					isPrimary={ false }
					onClick={ function ( event ) {
						gaRecordEvent(
							'Me',
							'Clicked On Step 2 Cancel 2fa Button',
							'method',
							this.state.method
						);
						this.props.onCancel( event );
					}.bind( this ) }
				>
					{ this.props.translate( 'Cancel' ) }
				</FormButton>

				{ 'sms' === this.state.method ? (
					<FormButton
						disabled={ ! this.state.smsRequestsAllowed }
						isPrimary={ false }
						onClick={ function ( event ) {
							gaRecordEvent( 'Me', 'Clicked On Resend SMS Button' );
							this.onResendCode( event );
						}.bind( this ) }
					>
						{ this.props.translate( 'Resend Code', {
							context: 'A button label to let a user get the SMS code sent again.',
						} ) }
					</FormButton>
				) : (
					<FormButton
						isPrimary={ false }
						onClick={ function ( event ) {
							gaRecordEvent( 'Me', 'Clicked On Enable SMS Use SMS Button' );
							this.onVerifyBySMS( event );
						}.bind( this ) }
					>
						{ this.props.translate( 'Use SMS', {
							context: 'A button label to let a user switch to enabling Two-Step by SMS.',
						} ) }
					</FormButton>
				) }
			</FormButtonsBar>
		);
	};

	render() {
		return (
			<div>
				<Security2faProgress step={ 2 } />
				<form className="security-2fa-enable" onSubmit={ this.onCodeSubmit }>
					<div className="security-2fa-enable__inner">
						{ this.renderCodeBlock() }
						{ this.renderInputBlock() }
					</div>
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
