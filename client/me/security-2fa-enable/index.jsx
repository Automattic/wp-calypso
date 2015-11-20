/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-enable' ),
	QRCode = require( 'qrcode.react' );

/**
 * Internal dependencies
 */
var FormButton = require( 'components/forms/form-button' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormSettingExplanation = require( 'components/forms/form-setting-explanation' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	Security2faProgress = require( 'me/security-2fa-progress' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {

	displayName: 'Security2faEnable',

	mixins: [ React.addons.LinkedStateMixin ],

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

	renderQRCode: function() {
		return (
			<div>
				<p>
					{ this.translate( 'Scan this QR code with your mobile app:' ) }
				</p>
				{ this.state.otpAuthUri ? <QRCode value={ this.state.otpAuthUri } size={ 150 } /> : null }
			</div>
		);
	},

	renderTimeCode: function() {
		return (
			<div>
				<p>
					{ this.translate( 'Enter this time code into your mobile app:' ) }
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
			<div className="security-2fa-enable__first">
				<p className="security-2fa-enable__first-label">
					{ this.translate( 'First', { context: 'The first thing we want the user to do for Two-Step setup.' } ) }
				</p>
				{ ( 'scan' === this.state.method ) ? this.renderQRCode() : this.renderTimeCode() }
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
				{
					'scan' === this.state.method
					? this.translate( 'Enter the code your app gives you after scanning:' )
					: this.translate( 'Enter the code your app gives you after entering the time code:' )
				}
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
										onClick={ function() {
											analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Download Authy App Link' );
										} }
									/>,
									googleAuthenticatorLink: <a
										href="https://support.google.com/accounts/answer/1066447?hl=en"
										target="_blank"
										onClick={ function() {
											analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Download Google Authenticator Link' );
										} }
									/>
								}
							}
						)
					}
				</p>
				<p>
					<a
						className="security-2fa-enable__toggle"
						onClick={ function( event ) {
							analytics.ga.recordEvent( 'Me', 'Clicked On Barcode Toggle Link', 'current-method', this.state.method );
							this.toggleMethod( event );
						}.bind( this ) }
					>
						{ 'scan' === this.state.method ? this.translate( "Can't scan the barcode?" ) : this.translate( 'Prefer to scan the barcode?' ) }
					</a>
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
			<SimpleNotice
				isCompact
				status={ this.state.lastErrorType }
				onClick={ this.clearLastError }
				text={ this.state.lastError }
			/>
		);
	},

	renderInputBlock: function() {
		return (
			<div className="security-2fa-enable__next">
				{
					'sms' !== this.state.method
					? (
						<p className="security-2fa-enable__next-label">
							{ this.translate( 'Next', { context: 'The next thing we want the user to do for Two-Step setup.' } ) }
						</p>
					)
					: null
				}
				{ this.renderInputHelp() }
				<FormTextInput
					autoComplete="off"
					disabled={ this.state.submittingForm }
					name="verification-code"
					placeholder="123456"
					type="text"
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
			<div>
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
			</div>
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
