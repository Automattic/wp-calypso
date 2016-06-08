/**
 * External dependencies
 */
import React from 'react';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import head from 'lodash/head';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import debugModule from 'debug';
import classNames from 'classnames';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import analytics from 'lib/analytics';
import ValidationFieldset from 'signup/validation-fieldset';
import FormLabel from 'components/forms/form-label';
import FormPasswordInput from 'components/forms/form-password-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import notices from 'notices';
import Notice from 'components/notice';
import LoggedOutForm from 'components/logged-out-form';
import formState from 'lib/form-state';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import { getValueFromProgressStore, mergeFormWithValue, getFlowSteps } from 'signup/utils';

const VALIDATION_DELAY_AFTER_FIELD_CHANGES = 1500,
	debug = debugModule( 'calypso:signup-form:form' );

let usernamesSearched = [],
	timesUsernameValidationFailed = 0,
	timesPasswordValidationFailed = 0;

const resetAnalyticsData = () => {
	usernamesSearched = [];
	timesUsernameValidationFailed = 0;
	timesPasswordValidationFailed = 0;
};

export default React.createClass( {

	displayName: 'SignupForm',

	getInitialState() {
		return {
			notice: null,
			submitting: false,
			form: null,
			signedUp: false,
			validationInitialized: false
		};
	},

	getInitialFields() {
		return {
			email: this.props.email || null,
			username: null,
			password: null
		};
	},

	autoFillUsername( form ) {
		const steps = getFlowSteps( this.props.flowName );
		const domainSteps = steps.filter( step => step.match( /^domain/ ) );
		let domainName = getValueFromProgressStore( {
			stepName: domainSteps[0] || null,
			fieldName: 'siteUrl',
			signupProgressStore: this.props.signupProgressStore
		} );
		const siteName = getValueFromProgressStore( {
			stepName: 'site',
			fieldName: 'site',
			signupProgressStore: this.props.signupProgressStore
		} );
		if ( domainName ) {
			domainName = domainName.split( '.' )[ 0 ];
		}
		return mergeFormWithValue( {
			form,
			fieldName: 'username',
			fieldValue: siteName || domainName || null
		} );
	},

	componentWillMount() {
		debug( 'Mounting the SignupForm React component.' );
		this.formStateController = new formState.Controller( {
			initialFields: this.getInitialFields(),
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
			debounceWait: VALIDATION_DELAY_AFTER_FIELD_CHANGES,
			hideFieldErrorsOnChange: true,
			initialState: this.props.step ? this.props.step.form : undefined
		} );
		let initialState = this.formStateController.getInitialState();
		if ( this.props.signupProgressStore ) {
			initialState = this.autoFillUsername( initialState );
		}
		this.setState( { form: initialState } );
	},

	componentDidMount() {
		// If we initialized the form with an email, we need to validate the email
		if ( this.props.email ) {
			this.handleBlur();
		}
	},

	sanitizeEmail( email ) {
		return email && email.replace( /\s+/g, '' ).toLowerCase();
	},

	sanitizeUsername( username ) {
		return username && username.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase();
	},

	sanitize( fields, onComplete ) {
		const sanitizedEmail = this.sanitizeEmail( fields.email ),
			sanitizedUsername = this.sanitizeUsername( fields.username );

		if ( fields.email !== sanitizedEmail || fields.username !== sanitizedUsername ) {
			onComplete( {
				email: sanitizedEmail,
				username: sanitizedUsername
			} );
		}
	},

	validate( fields, onComplete ) {
		wpcom.undocumented().validateNewUser( fields, ( error, response ) => {
			if ( this.state.readyToLogin || this.props.submitting ) {
				// this is a stale callback, we have already signed up or are logging in
				return;
			}

			if ( error || ! response ) {
				return debug( error || 'User validation failed.' );
			}

			let { messages } = response;

			if ( response.success ) {
				messages = {};
			} else {
				forEach( messages, ( fieldError, field ) => {
					if ( ! formState.isFieldInvalid( this.state.form, field ) ) {
						return;
					}

					if ( field === 'username' && ! includes( usernamesSearched, fields.username ) ) {
						analytics.tracks.recordEvent( 'calypso_signup_username_validation_failed', {
							error: head( keys( fieldError ) ),
							username: fields.username
						} );

						timesUsernameValidationFailed++;
					}

					if ( field === 'password' ) {
						analytics.tracks.recordEvent( 'calypso_signup_password_validation_failed', {
							error: head( keys( fieldError ) )
						} );

						timesPasswordValidationFailed++;
					}
				} );
			}

			if ( fields.email ) {
				if ( this.props.signupDependencies && this.props.signupDependencies.domainItem ) {
					const domainInEmail = fields.email.split( '@' )[ 1 ];
					if ( this.props.signupDependencies.domainItem.meta === domainInEmail ) {
						// if the user tries to use an email address from the domain they're trying to register,
						// show an error message.
						messages = Object.assign( {}, messages, {
							email: {
								invalid: this.translate( 'Use a working email address, so you can receive our messages.' )
							}
						} );
					}
				}
			}

			onComplete( error, messages );
			if ( ! this.state.validationInitialized ) {
				this.setState( { validationInitialized: true } );
			}
		} );
	},

	setFormState( state ) {
		this.setState( { form: state } );
	},

	handleFormControllerError( error ) {
		if ( error ) {
			throw error;
		}
	},

	handleChangeEvent( event ) {
		const name = event.target.name,
			value = event.target.value;

		this.setState( { notice: null } );

		this.formStateController.handleFieldChange( {
			name: name,
			value: value
		} );
	},

	handleBlur() {
		this.formStateController.sanitize();
		this.formStateController.validate();
		this.props.save && this.props.save( this.state.form );
	},

	handleSubmit( event ) {
		event.preventDefault();

		if ( this.state.submitting ) {
			return;
		}

		this.setState( { submitting: true } );

		if ( this.props.submitting ) {
			resetAnalyticsData();

			// the user was already created, so skip validation continue
			this.props.goToNextStep();
			return;
		}

		this.formStateController.handleSubmit( hasErrors => {
			if ( hasErrors ) {
				this.setState( { submitting: false } );
				return;
			}

			let analyticsData = {
				unique_usernames_searched: usernamesSearched.length,
				times_username_validation_failed: timesUsernameValidationFailed,
				times_password_validation_failed: timesPasswordValidationFailed
			};
			this.props.submitForm( this.state.form, this.getUserData(), analyticsData );
			resetAnalyticsData();
		} );
	},

	globalNotice( notice ) {
		return <Notice
			className="signup-form__notice"
			isCompact={ true }
			showDismiss={ false }
			status={ notices.getStatusHelper( notice ) }
			text={ notice.message } />;
	},

	getUserData() {
		return {
			username: formState.getFieldValue( this.state.form, 'username' ),
			password: formState.getFieldValue( this.state.form, 'password' ),
			email: formState.getFieldValue( this.state.form, 'email' )
		};
	},

	getErrorMessagesWithLogin( fieldName ) {
		const messages = formState.getFieldErrorMessages( this.state.form, fieldName );
		if ( ! messages ) {
			return;
		}

		let link = config( 'login_url' ) + '?redirect_to=' + this.props.getRedirectToAfterLoginUrl;
		return map( messages, ( message, error_code ) => {
			if ( error_code === 'taken' ) {
				link += '&email_address=' + encodeURIComponent( formState.getFieldValue( this.state.form, fieldName ) );
				return (
					<span>
						<p>
							{ message }&nbsp;
							{ this.translate( 'If this is you {{a}}log in now{{/a}}.', {
								components: {
									a: <a href={ link } />
								}
							} ) }
						</p>
					</span>
				);
			}
			return message;
		} );
	},

	formFields() {
		return (
			<div>
				<ValidationFieldset errorMessages={ this.getErrorMessagesWithLogin( 'email' ) }>
					<FormLabel htmlFor="email">{ this.translate( 'Your email address' ) }</FormLabel>
					<FormTextInput
						autoFocus={ ! this.props.email }
						autoCapitalize="off"
						autoCorrect="off"
						className="signup-form__input"
						disabled={ this.state.submitting || !! this.props.disabled || !! this.props.disableEmailInput }
						id="email"
						name="email"
						type="email"
						value={ formState.getFieldValue( this.state.form, 'email' ) }
						isError={ formState.isFieldInvalid( this.state.form, 'email' ) }
						isValid={ ! this.props.disableEmailInput && this.state.validationInitialized && formState.isFieldValid( this.state.form, 'email' ) }
						onBlur={ this.handleBlur }
						onChange={ this.handleChangeEvent } />
					{ this.emailDisableExplanation() }
				</ValidationFieldset>

				<ValidationFieldset errorMessages={ this.getErrorMessagesWithLogin( 'username' ) }>
					<FormLabel htmlFor="username">{ this.translate( 'Choose a username' ) }</FormLabel>
					<FormTextInput
						autoFocus={ ! ! this.props.email }
						autoCapitalize="off"
						autoCorrect="off"
						className="signup-form__input"
						disabled={ this.state.submitting || this.props.disabled }
						id="username"
						name="username"
						value={ formState.getFieldValue( this.state.form, 'username' ) }
						isError={ formState.isFieldInvalid( this.state.form, 'username' ) }
						isValid={ formState.isFieldValid( this.state.form, 'username' ) }
						onBlur={ this.handleBlur }
						onChange={ this.handleChangeEvent } />
				</ValidationFieldset>

				<ValidationFieldset errorMessages={ formState.getFieldErrorMessages( this.state.form, 'password' ) }>
					<FormLabel htmlFor="password">{ this.translate( 'Choose a password' ) }</FormLabel>
					<FormPasswordInput
						className="signup-form__input"
						disabled={ this.state.submitting || this.props.disabled }
						id="password"
						name="password"
						value={ formState.getFieldValue( this.state.form, 'password' ) }
						isError={ formState.isFieldInvalid( this.state.form, 'password' ) }
						isValid={ formState.isFieldValid( this.state.form, 'password' ) }
						onBlur={ this.handleBlur }
						onChange={ this.handleChangeEvent }
						submitting={ this.state.submitting || this.props.submitting } />
					<FormSettingExplanation>
						{ this.translate( 'Your password must be at least six characters long.' ) }
					</FormSettingExplanation>
				</ValidationFieldset>
			</div>
		);
	},

	handleOnClickTos() {
		analytics.tracks.recordEvent.bind(
			analytics,
			'calypso_signup_tos_link_click'
		);
	},

	getTermsOfServiceUrl() {
		// locales where we don't have translated TOS will simply show the English one
		return 'https://' + i18n.getLocaleSlug() + '.wordpress.com/tos/';
	},

	termsOfServiceLink() {
		return (
			<p className="signup-form__terms-of-service-link">{
				this.translate(
					'By creating an account you agree to our {{a}}fascinating Terms of Service{{/a}}.',
					{
						components: {
							a: <a
								href={ this.getTermsOfServiceUrl() }
								onClick={ this.handleOnClickTos }
								target="_blank" />
						}
					}
				)
			}</p>
		);
	},

	getNotice() {
		if ( this.props.step && 'invalid' === this.props.step.status ) {
			return this.globalNotice( this.props.step.errors[ 0 ] );
		}
		if ( this.state.notice ) {
			return this.globalNotice( this.state.notice );
		}
		return false;
	},

	emailDisableExplanation() {
		if ( this.props.disableEmailInput && this.props.disableEmailExplanation ) {
			return (
				<FormSettingExplanation noValidate={ true }>{ this.props.disableEmailExplanation }</FormSettingExplanation>
			);
		}
	},

	formFooter() {
		return (
			<LoggedOutFormFooter>
				{ this.getNotice() }
				{ this.termsOfServiceLink() }
				<FormButton className="signup-form__submit" disabled={ this.state.submitting || this.props.disabled }>
					{ this.props.submitButtonText }
				</FormButton>
			</LoggedOutFormFooter>
		);
	},

	localizeUrlWithSubdomain( url ) {
		const urlArray = url.split( '//' );
		let returnUrl = urlArray[ 0 ] + '//';
		if ( this.props.locale ) {
			returnUrl += this.props.locale + '.';
		}
		return returnUrl + urlArray[ 1 ];
	},

	localizeUrlWithLastSlug( url ) {
		return ( this.props.locale ) ? '/log-in/' + this.props.locale : url;
	},

	footerLink() {
		if ( this.props.positionInFlow !== 0 ) {
			return;
		}

		const logInUrl = this.localizeUrlWithSubdomain( config( 'login_url' ) );

		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ logInUrl }>
					{ this.translate( 'Already have a WordPress.com account? Log in now.' ) }
				</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
		);
	},

	render() {
		return (
			<div className={ classNames( 'signup-form', this.props.className ) }>
				<LoggedOutForm onSubmit={ this.handleSubmit } noValidate={ true }>
					{ this.props.formHeader &&
						<header className="signup-form__header">
							{ this.props.formHeader }
						</header>
					}
					{ this.formFields() }
					{ this.props.formFooter || this.formFooter() }
				</LoggedOutForm>

				{ this.props.footerLink || this.footerLink() }
			</div>
		);
	}
} );
