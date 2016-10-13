/**
 * External dependencies
 */
var React = require( 'react' ),
	LinkedStateMixin = require( 'react-addons-linked-state-mixin' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-enable' ),
	QRCode = require( 'qrcode.react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var FormButton = require( 'components/forms/form-button' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormSettingExplanation = require( 'components/forms/form-setting-explanation' ),
	FormTelInput = require( 'components/forms/form-tel-input' ),
	Notice = require( 'components/notice' ),
	Security2faProgress = require( 'me/security-2fa-progress' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	analytics = require( 'lib/analytics' ),
	constants = require( 'me/constants' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' );

module.exports = React.createClass( {

	displayName: 'Security2faEnable',

	mixins: [ LinkedStateMixin ],

	codeRequestTimer: false,

	getDefaultProps: function() {
		return {
			doSMSFlow: false
		};
	},

	propTypes: {
		doSMSFlow: React.PropTypes.bool,
		onCancel: React.PropTypes.func.isRequired,
		onSuccess: React.PropTypes.func.isRequired,
	},

	getInitialState: function() {
		return {
			lastError: false,
			lastErrorType: false,
			method: this.props.doSMSFlow ? 'sms' : 'scan',
			otpAuthUri: false,
			smsRequestsAllowed: true,
			smsRequestPerformed: false,
			submittingCode: false,
			timeCode: false,
			verificationCode: ''
		};
	},

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
		twoStepAuthorization.getAppAuthCodes( this.onAppAuthCodesRequestResponse );
		if ( this.props.doSMSFlow ) {
			this.requestSMS();
		}
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
		this.cancelCodeRequestTimer();
	},

	allowSMSRequests: function() {
		this.setState( { smsRequestsAllowed: true } );
	},

	onRequestSMS: function( event ) {
		event.preventDefault();
		this.requestSMS();
	},

	requestSMS: function() {
		this.setState(
			{
				smsRequestsAllowed: false,
				lastError: false
			}
		);
		twoStepAuthorization.sendSMSCode( this.onSMSRequestResponse );
		this.codeRequestTimer = setTimeout( this.allowSMSRequests, 60000 );
	},

	onSMSRequestResponse: function( error ) {
		if ( error ) {
			this.setState(
				{
					smsRequestPerformed: false,
					lastError: this.translate( 'Unable to request a code via SMS right now. Please try again after one minute.' ),
					lastErrorType: 'is-info'
				}
			);
		} else {
			this.setState( { smsRequestPerformed: true } );
		}
	},

	cancelCodeRequestTimer: function() {
		if ( this.codeRequestTimer ) {
			clearTimeout( this.codeRequestTimer );
		}
	},

	onResendCode: function( event ) {
		event.preventDefault();
		if ( this.state.smsRequestsAllowed ) {
			this.requestSMS();
		}
	},

	onVerifyBySMS: function( event ) {
		event.preventDefault();
		if ( this.state.smsRequestsAllowed ) {
			this.requestSMS();
		}
		this.setState( { method: 'sms' } );
	},

	onAppAuthCodesRequestResponse: function( error, data ) {
		if ( error ) {
			this.setState(
				{
					lastError: this.translate( 'Unable to obtain authorization application setup information. Please try again later.' ),
					lastErrorType: 'is-error'
				}
			);
			return;
		}

		this.setState(
			{
				otpAuthUri: data.otpauth_uri,
				timeCode: data.time_code
			}
		);
	},

	getFormDisabled: function() {
		return ( this.state.submittingCode || 6 > this.state.verificationCode.trim().length );
	},

	onCodeSubmit: function( event ) {
		event.preventDefault();
		this.setState( { submittingCode: true }, this.onBeginCodeValidation );
	},

	onBeginCodeValidation: function() {
		var args = {
			code: this.state.verificationCode,
			action: 'enable-two-step'
		};

		twoStepAuthorization.validateCode( args, this.onValidationResponseReceived );
	},

	onValidationResponseReceived: function( error, data ) {
		this.setState( { submittingCode: false } );

		if ( error ) {
			this.setState(
				{
					lastError: this.translate( 'An unexpected error occurred. Please try again later.' ),
					lastErrorType: 'is-error'
				}
			);
		} else if ( ! data.success ) {
			this.setState(
				{
					lastError: this.translate( 'You entered an invalid code. Please try again.' ),
					lastErrorType: 'is-error'
				}
			);
		} else {
			this.props.onSuccess();
		}
	},

	getToggleLink: function() {
		return (
			<a
				className="security-2fa-enable__toggle"
				onClick={ function( event ) {
					this.toggleMethod( event );
					analytics.ga.recordEvent( 'Me', 'Clicked On Barcode Toggle Link', 'current-method', this.state.method );
				}.bind( this ) }
			/>
		);
	},

	renderQRCode: function() {
		var qrClasses = classNames( 'security-2fa-enable__qr-code', {
			'is-placeholder': ! this.state.otpAuthUri
		} );

		return (
			<div className="security-2fa-enable__qr-code-block">
				<p className="security-2fa-enable__qr-instruction">
					{
						this.translate(
							"Scan this QR code with your mobile app. {{toggleMethodLink}}Can't scan the code?{{/toggleMethodLink}}", {
								components: {
									toggleMethodLink: this.getToggleLink()
								}
							}
						)
					}
				</p>
				<div className={ qrClasses }>
					{ this.state.otpAuthUri &&
						<QRCode value={ this.state.otpAuthUri } size={ 150 } />
					}
				</div>
			</div>
		);
	},

	renderTimeCode: function() {
		return (
			<div className="security-2fa-enable__time-code-block">
				<p className="security-2fa-enable__time-instruction">
					{
						this.translate(
							'Enter this time code into your mobile app. {{toggleMethodLink}}Prefer to scan the code?{{/toggleMethodLink}}', {
								components: {
									toggleMethodLink: this.getToggleLink()
								}
							}
						)
					}
				</p>
				<p className="security-2fa-enable__time-code">
					{ this.state.timeCode }
				</p>
			</div>
		);
	},

	renderCodeBlock: function() {
		if ( 'sms' === this.state.method ) {
			return null;
		}

		return (
			<div className="security-2fa-enable__code-block">
				{ 'scan' === this.state.method ? this.renderQRCode() : this.renderTimeCode() }
			</div>
		);
	},

	renderInputHelp: function() {
		if ( 'sms' === this.state.method ) {
			return (
				<FormLabel htmlFor="verification-code">{ this.translate( 'Enter the code you receive via SMS:' ) }</FormLabel>
			);
		}

		return (
			<p>
				{ this.translate( 'Then enter the six digit code provided by the app:' ) }
			</p>
		);
	},

	toggleMethod: function( event ) {
		event.preventDefault();
		this.setState( { method: 'scan' === this.state.method ? 'time' : 'scan' } );
	},

	renderInputOptions: function() {
		if ( 'sms' === this.state.method ) {
			return null;
		}

		return (
			<div className="security-2fa-enable__app-options">
				<p>
					{
						this.translate(
							'Not sure what this screen means? You may need to download ' +
							'{{authyLink}}Authy{{/authyLink}} or ' +
							'{{googleAuthenticatorLink}}Google Authenticator{{/googleAuthenticatorLink}} ' +
							'for your phone.',
							{
								components: {
									authyLink: <a
										href="https://www.authy.com/users/"
										target="_blank"
										rel="noopener noreferrer"
										onClick={ function() {
											analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Download Authy App Link' );
										} }
									/>,
									googleAuthenticatorLink: <a
										href="https://support.google.com/accounts/answer/1066447?hl=en"
										target="_blank"
										rel="noopener noreferrer"
										onClick={ function() {
											analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Download Google Authenticator Link' );
										} }
									/>
								}
							}
						)
					}
				</p>
			</div>
		);
	},

	clearLastError: function() {
		this.setState( { lastError: false, lastErrorType: false } );
	},

	possiblyRenderError: function() {
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
	},

	renderInputBlock: function() {
		return (
			<div className="security-2fa-enable__next">
				{ this.renderInputHelp() }
				<FormTelInput
					autoComplete="off"
					autoFocus
					disabled={ this.state.submittingForm }
					name="verification-code"
					placeholder={ 'sms' === this.state.method ? constants.sevenDigit2faPlaceholder : constants.sixDigit2faPlaceholder }
					valueLink={ this.linkState( 'verificationCode' ) }
					onFocus={ function() {
						analytics.ga.recordEvent( 'Me', 'Focused On 2fa Enable Verification Code Input' );
					} }
				/>
				{
					'sms' === this.state.method && this.state.smsRequestPerformed
					? (
						<FormSettingExplanation>
							{
								this.translate(
									'A code has been sent to your device via SMS.  ' +
									'You may request another code after one minute.'
								)
							}
						</FormSettingExplanation>
					)
					: null
				}
				{ this.possiblyRenderError() }
				{ this.renderInputOptions() }
			</div>
		);
	},

	renderButtons: function() {
		return (
			<FormButtonsBar className="security-2fa-enable__buttons-bar">
				<FormButton
					className="security-2fa-enable__verify"
					disabled={ this.getFormDisabled() }
					onClick={ function() {
						analytics.ga.recordEvent( 'Me', 'Clicked On Enable 2fa Button', 'method', this.state.method );
					}.bind( this ) }
				>
					{ this.state.submittingCode ? this.translate( 'Enabling…', { context: 'A button label used during Two-Step setup.' } ) : this.translate( 'Enable', { context: 'A button label used during Two-Step setup.' } ) }
				</FormButton>

				<FormButton
					className="security-2fa-enable__cancel"
					isPrimary={ false }
					onClick={ function( event ) {
						analytics.ga.recordEvent( 'Me', 'Clicked On Step 2 Cancel 2fa Button', 'method', this.state.method );
						this.props.onCancel( event );
					}.bind( this ) }
				>
					{ this.translate( 'Cancel' ) }
				</FormButton>

				{
					'sms' === this.state.method
					? (
						<FormButton
							disabled={ ! this.state.smsRequestsAllowed }
							isPrimary={ false }
							onClick={ function( event ) {
								analytics.ga.recordEvent( 'Me', 'Clicked On Resend SMS Button' );
								this.onResendCode( event );
							}.bind( this ) }
						>
							{ this.translate( 'Resend Code', { context: 'A button label to let a user get the SMS code sent again.' } ) }
						</FormButton>
					)
					: (
						<FormButton
							isPrimary={ false }
							onClick={ function( event ) {
								analytics.ga.recordEvent( 'Me', 'Clicked On Enable SMS Use SMS Button' );
								this.onVerifyBySMS( event );
							}.bind( this ) }
						>
							{ this.translate( 'Use SMS', { context: 'A button label to let a user switch to enabling Two-Step by SMS.' } ) }
						</FormButton>
					)

				}
			</FormButtonsBar>
		);
	},

	render: function() {
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
} );
