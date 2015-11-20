/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:phone:form' );
/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	notices = require( 'notices' ),
	Notice = require( 'notices/notice' ),
	observe = require( 'lib/mixins/data-observe' ),
	FormPhoneInput = require( 'components/forms/form-phone-input' ),
	FormButton = require( 'components/forms/form-button' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	WpcomLoginForm = require( 'signup/wpcom-login-form' );

module.exports = React.createClass( {
	displayName: 'PhoneSignupForm',

	mixins: [ observe( 'countriesList' ) ],

	getInitialState: function() {
		return {
			phoneNumber: null,
			step: 'phone',
			submitting: false,
			notice: null
		};
	},

	componentWillMount: function() {
		debug( 'Mounting the PhoneSignupForm React component.' );
	},

	changePhone: function( phoneNumber ) {
		this.setState( { phoneNumber: phoneNumber } );
	},

	changeCode: function( event ) {
		this.changeField( event.target.name, this.formatNumber( event.target.value ) );
	},

	changeField: function( name, value ) {
		var stateObject = {};
		stateObject[ name ] = value;
		this.setState( stateObject );
	},

	submitPhoneNumber: function( event ) {
		event.preventDefault();

		var phoneNumber = this.state.phoneNumber;
		if ( ! phoneNumber ) {
			phoneNumber = this.refs.phoneInput.getValue();
		}

		this.setState( { submitting: true } );

		if ( ! phoneNumber.isValid ) {
			this.setState( {
				submitting: false,
				notice: phoneNumber.validation
			} );
			return;
		}

		this.setState( { notice: { info: true, message: this.translate( 'Creating your account…' ) } } );

		debug( 'signup with phone number: %o', this.state );

		wpcom.undocumented().usersPhoneNew( { phoneNumber: phoneNumber.phoneNumberFull }, this.handleUsersPhoneNewResponse );
	},

	handleUsersPhoneNewResponse: function( error, response ) {
		var notice, step;

		if ( error && error.error ) {
			debug( error.error, error.message );
			step = this.state.step; // Unchanged
			notice = error;
		}

		if ( response ) {
			debug( 'Signup sucessful' );
			notice = response;
			step = 'verify';
		}

		this.setState( {
			step: step,
			submitting: false,
			notice: notice
		} );
	},

	submitVerificationCode: function( event ) {
		event.preventDefault();

		debug( 'verify with phone number: %o', this.state );

		this.setState( {
			submitting: true,
			notice: {
				info: true,
				message: this.translate( 'Sending verification code…', {
					comment: 'Shown to a user one they submit the verification code we sent them in an SMS'
				} )
			}
		} );

		wpcom.undocumented().usersPhoneVerification( {
			code: this.state.code,
			phoneNumber: this.state.phoneNumber.phoneNumberFull
		}, this.handleUsersPhoneVerification );
	},

	handleUsersPhoneVerification: function( error, response ) {
		if ( error && error.error ) {
			debug( error.error, error.message );
			this.setState( {
				submitting: false,
				notice: error
			} );
		}

		if ( response ) {
			debug( 'Verification sucessful' );
			this.setState( { notice: response } );

			// Set the login data so that the login form will render
			this.setState( { loginData: response } );
		}
	},

	renderPhone: function() {
		return (
			<form className="phone-signup-form__form" onSubmit={ this.submitPhoneNumber }>
				{ this.renderNotice() }
				<FormPhoneInput
					ref="phoneInput"
					disabled={ this.state.submitting }
					countriesList={ this.props.countriesList }
					phoneInputProps={ {
						autoComplete: 'off',
						autoFocus: true,
						placeholder: this.translate( 'Phone number' )
					} }
					onChange={ this.changePhone }
					/>
				<FormButton className="phone-signup-form__submit" disabled={ this.state.submitting } >
					{ this.state.submitting ? this.translate( 'Creating Your Account…' ) : this.translate( 'Create My Account' ) }
				</FormButton>
			</form>
		);
	},

	renderVerify: function() {
		return (
			<div>
				<form className="phone-signup-form__form" onSubmit={ this.submitVerificationCode }>
					{ this.renderNotice() }
					<FormFieldset className="phone-signup-form__fieldset">
						<FormLabel htmlFor="code" className="phone-signup-form__label">
							{ this.translate( 'Verification Code' ) }
						</FormLabel>
						<FormTextInput
							className="phone-signup-form__input"
							autoComplete="off"
							type="tel"
							name="code"
							id="code"
							autoFocus={ true }
							disabled={ this.state.submitting }
							placeholder={ this.translate( 'Enter your code' ) }
							onChange={ this.changeCode } />
					</FormFieldset>
					<FormButton className="phone-signup-form__submit" disabled={ this.state.submitting } >
						{ this.state.submitting ? this.translate( 'Submitting Verification Code…' ) : this.translate( 'Submit Verification Code' ) }
					</FormButton>
				</form>
				{ this.wpcomLogin() }
			</div>
		);
	},

	renderNotice: function() {
		if ( this.state.notice ) {
			return <Notice
				className="phone-signup-form__notice"
				isCompact={ true }
				showDismiss={ false }
				status={ notices.getStatusHelper( this.state.notice ) }
				text={ this.state.notice.message } />;
		}
	},

	wpcomLogin: function() {
		if ( this.state.loginData ) {
			return <WpcomLoginForm
				log={ this.state.loginData.user.data.user_login }
				authorization={ 'Bearer ' + this.state.loginData.token.access_token }
				redirectTo={ window.location.origin + '?welcome' }
			/>;
		}
	},

	render: function() {
		var form;
		if ( 'phone' === this.state.step ) {
			form = this.renderPhone();
		} else if ( 'verify' === this.state.step ) {
			form = this.renderVerify();
		}
		return (
			<div className="phone-signup-form">
				<h2 className="phone-signup-form__header">{ this.translate( 'Sign up for WordPress.com' ) }</h2>
				<h3 className="phone-signup-form__tagline">{ this.translate( 'Use your phone number to sign up for WordPress.com.' ) }</h3>
				{ form }
			</div>
		);
	}
} );
