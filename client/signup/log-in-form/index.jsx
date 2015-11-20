/**
 * External dependencies
 */
var React = require( 'react' ),
	emailValidator = require( 'email-validator' ),
	debug = require( 'debug' )( 'calypso:login' );
/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	notices = require( 'notices' ),
	Notice = require( 'notices/notice' ),
	FormButton = require( 'components/forms/form-button' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	WpcomLoginForm = require( 'signup/wpcom-login-form' ),
	LoggedOutForm = require( 'signup/logged-out-form' );

module.exports = React.createClass( {
	displayName: 'LoginForm',

	getInitialState: function() {
		return {
			email: '',
			step: 'email',
			submitting: false,
			notice: null
		};
	},

	componentWillMount: function() {
		debug( 'Mounting the LoginForm React component.' );
	},

	changeField: function( event ) {
		var stateObject = {};
		stateObject[ event.target.name ] = event.target.value;
		this.setState( stateObject );
	},

	validateEmail: function() {
		if ( ! emailValidator.validate( this.state.email ) ) {
			return {
				error: 'invalid_email',
				message: 'The email address is invalid'
			};
		}
	},

	onSubmit: function( event ) {
		if ( 'email' === this.state.step ) {
			this.submitEmail( event );
		} else if ( 'verify' === this.state.step ) {
			this.submitVerificationCode( event );
		}
	},

	submitEmail: function( event ) {
		event.preventDefault();

		var validationNotices = this.validateEmail();

		this.setState( { submitting: true } );

		if ( validationNotices && validationNotices.error ) {
			this.setState( {
				submitting: false,
				notice: validationNotices
			} );
			return;
		}

		this.setState( { notice: { info: true, message: this.translate( 'Logging you in…' ) } } );

		debug( 'Login with email: %o', this.state );

		wpcom.undocumented().usersEmail( { email: this.state.email }, this.handleUsersEmailResponse );
	},

	handleUsersEmailResponse: function( error, response ) {
		var notice, step;

		if ( error && error.error ) {
			debug( error.error, error.message );
			step = this.state.step; // Unchanged
			notice = error;
		}

		if ( response ) {
			debug( 'Code generation sucessful' );
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

		debug( 'verify with email address: %o', this.state );

		this.setState( {
			submitting: true,
			notice: {
				info: true,
				message: this.translate( 'Sending verification code…', {
					comment: 'Shown to a user one they submit the verification code we sent them in an SMS'
				} )
			}
		} );

		wpcom.undocumented().usersEmailVerification( {
			code: this.state.code,
			email: this.state.email
		}, this.handleUsersEmailVerification );
	},

	handleUsersEmailVerification: function( error, response ) {
		if ( error && error.error ) {
			debug( error.error, error.message );
			this.setState( {
				submitting: false,
				notice: error
			} );
		}

		if ( response ) {
			debug( 'Verification sucessful' );
			// Set the login data so that the login form will render
			this.setState( {
				notice: response,
				loginData: response
			} );
		}
	},

	renderEmailFields: function() {
		return (
			<div>
				{ this.renderNotice() }
				<FormFieldset className="log-in-form__fieldset">
					<FormLabel htmlFor="email" className="log-in-form__label">
						{ this.translate( 'Email Address' ) }
					</FormLabel>
					<FormTextInput
						className="log-in-form__input"
						autoComplete="off"
						autoFocus={ true }
						disabled={ this.state.submitting }
						name="email"
						id="email"
						value={ this.state.email }
						onChange={ this.changeField } />
				</FormFieldset>
			</div>
		);
	},

	renderVerifyFields: function() {
		return (
			<div>
				{ this.renderLocaleSuggestions() }
				{ this.renderNotice() }
				<FormFieldset className="log-in-form__fieldset">
					<FormLabel htmlFor="code" className="log-in-form__label">
						{ this.translate( 'Verification Code' ) }
					</FormLabel>
					<FormTextInput
						className="log-in-form__input"
						autoComplete="off"
						type="tel"
						name="code"
						id="code"
						autoFocus={ true }
						disabled={ this.state.submitting }
						placeholder={ this.translate( 'Enter your code' ) }
						onChange={ this.changeField } />
				</FormFieldset>
			</div>
		);
	},

	renderNotice: function() {
		if ( this.state.notice ) {
			return <Notice
				className="log-in-form__notice"
				isCompact={ true }
				showDismiss={ false }
				status={ notices.getStatusHelper( this.state.notice ) }
				text={ this.state.notice.message } />;
		}
	},

	wpcomLogin: function() {
		if ( this.state.loginData ) {
			var redirectTo = window.location.origin;
			if ( this.state.loginData.new_user ) {
				redirectTo += '?welcome';
			}
			return <WpcomLoginForm
				log={ this.state.loginData.user.data.user_login }
				authorization={ 'Bearer ' + this.state.loginData.token.access_token }
				redirectTo={ redirectTo }
			/>;
		}
	},

	formFields: function() {
		if ( 'email' === this.state.step ) {
			return this.renderEmailFields();
		} else if ( 'verify' === this.state.step ) {
			return this.renderVerifyFields();
		}
	},

	formFooter: function() {
		return (
			<FormButton className="log-in-form__submit" disabled={ this.state.submitting } >
				{ this.submitButtonText() }
			</FormButton>
		);
	},

	submitButtonText: function() {
		if ( 'email' === this.state.step ) {
			return this.state.submitting ? this.translate( 'Logging you in…' ) : this.translate( 'Log Me In' );
		} else if ( 'verify' === this.state.step ) {
			return this.state.submitting ? this.translate( 'Submitting Verification Code…' ) : this.translate( 'Submit Verification Code' );
		}
	},

	footerLink: function() {
		var startUrl = this.props.locale ? '/start/' + this.props.locale : '/start';

		return <a href={ startUrl } className="logged-out-form__link">{ this.translate( 'New to WordPress.com? Sign up now.' ) }</a>;
	},

	render: function() {
		return (
			<LoggedOutForm
				className='log-in-form'
				headerText={ this.translate( 'Welcome Back :)' ) }
				subHeaderText={ this.translate( 'Enter your email to log in without a password.' ) }
				formFields={ this.formFields() }
				formFooter={ this.formFooter() }
				footerLink={ this.footerLink() }
				locale={ this.props.locale }
				onSubmit={ this.onSubmit }
				path={ this.props.path }
				wpcomLogin={ this.wpcomLogin } />
		);
	}
} );
