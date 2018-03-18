/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, forEach, head, includes, keys, map } from 'lodash';
import debugModule from 'debug';
import classNames from 'classnames';
import i18n, { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { addLocaleToWpcomUrl } from 'lib/i18n-utils';
import wpcom from 'lib/wp';
import config from 'config';
import analytics from 'lib/analytics';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormPasswordInput from 'components/forms/form-password-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import notices from 'notices';
import Notice from 'components/notice';
import LoggedOutForm from 'components/logged-out-form';
import { login } from 'lib/paths';
import formState from 'lib/form-state';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormBackLink from 'components/logged-out-form/back-link';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import { mergeFormWithValue } from 'signup/utils';
import SocialSignupForm from './social';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { createSocialUserFailed } from 'state/login/actions';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import { getSectionName } from 'state/ui/selectors';

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

class SignupForm extends Component {
	static propTypes = {
		className: PropTypes.string,
		disableEmailExplanation: PropTypes.bool,
		disableEmailInput: PropTypes.bool,
		disabled: PropTypes.bool,
		email: PropTypes.string,
		footerLink: PropTypes.node,
		formHeader: PropTypes.node,
		redirectToAfterLoginUrl: PropTypes.string.isRequired,
		goToNextStep: PropTypes.func,
		handleSocialResponse: PropTypes.func,
		isSocialSignupEnabled: PropTypes.bool,
		locale: PropTypes.string,
		positionInFlow: PropTypes.number,
		save: PropTypes.func,
		signupDependencies: PropTypes.object,
		step: PropTypes.object,
		submitButtonText: PropTypes.string.isRequired,
		submitting: PropTypes.bool,
		suggestedUsername: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,

		// Connected props
		oauth2Client: PropTypes.object,
		sectionName: PropTypes.string,
	};

	static defaultProps = {
		isSocialSignupEnabled: false,
	};

	state = {
		notice: null,
		submitting: false,
		form: null,
		signedUp: false,
		validationInitialized: false,
	};

	getInitialFields() {
		return {
			email: this.props.email || '',
			username: '',
			password: '',
		};
	}

	autoFillUsername( form ) {
		return mergeFormWithValue( {
			form,
			fieldName: 'username',
			fieldValue: this.props.suggestedUsername || '',
		} );
	}

	recordBackLinkClick = () => {
		analytics.tracks.recordEvent( 'calypso_signup_back_link_click' );
	};

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
			initialState: this.props.step ? this.props.step.form : undefined,
		} );

		const initialState = this.formStateController.getInitialState();
		const stateWithFilledUsername = this.autoFillUsername( initialState );

		this.maybeRedirectToSocialConnect( this.props );

		this.setState( { form: stateWithFilledUsername } );
	}

	getUserExistsError( props ) {
		const { step } = props;

		if ( ! step || step.status !== 'invalid' ) {
			return null;
		}

		const userExistsError = find( step.errors, error => error.error === 'user_exists' );

		return userExistsError;
	}

	/***
	 * If the step is invalid because we had an error that the user exists,
	 * we should prompt user with a request to connect his social account
	 * to his existing WPCOM account
	 *
	 * @param {Object} props react component props that has step info
	 */
	maybeRedirectToSocialConnect( props ) {
		const userExistsError = this.getUserExistsError( props );

		if ( userExistsError ) {
			const { service, id_token, access_token } = props.step;
			const socialInfo = { service, id_token, access_token };

			this.props.createSocialUserFailed( socialInfo, userExistsError );
			page(
				login( {
					isNative: config.isEnabled( 'login/native-login-links' ),
					redirectTo: this.props.redirectToAfterLoginUrl,
				} )
			);
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.step && nextProps.step && this.props.step.status !== nextProps.step.status ) {
			this.maybeRedirectToSocialConnect( nextProps );
		}
	}

	sanitizeEmail( email ) {
		return email && email.replace( /\s+/g, '' ).toLowerCase();
	}

	sanitizeUsername( username ) {
		return username && username.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase();
	}

	sanitize = ( fields, onComplete ) => {
		const sanitizedEmail = this.sanitizeEmail( fields.email ),
			sanitizedUsername = this.sanitizeUsername( fields.username );

		if ( fields.email !== sanitizedEmail || fields.username !== sanitizedUsername ) {
			onComplete( {
				email: sanitizedEmail,
				username: sanitizedUsername,
			} );
		}
	};

	validate = ( fields, onComplete ) => {
		wpcom.undocumented().validateNewUser( fields, ( error, response ) => {
			if ( this.props.submitting ) {
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
							username: fields.username,
						} );

						timesUsernameValidationFailed++;
					}

					if ( field === 'password' ) {
						analytics.tracks.recordEvent( 'calypso_signup_password_validation_failed', {
							error: head( keys( fieldError ) ),
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
								invalid: this.props.translate(
									'Use a working email address, so you can receive our messages.'
								),
							},
						} );
					}
				}
			}

			onComplete( error, messages );
			if ( ! this.state.validationInitialized ) {
				this.setState( { validationInitialized: true } );
			}
		} );
	};

	setFormState = state => {
		this.setState( { form: state } );
	};

	handleFormControllerError( error ) {
		if ( error ) {
			throw error;
		}
	}

	handleChangeEvent = event => {
		const name = event.target.name,
			value = event.target.value;

		this.setState( { notice: null } );

		this.formStateController.handleFieldChange( {
			name: name,
			value: value,
		} );
	};

	handleBlur = () => {
		const data = this.getUserData();
		// When a user moves away from the signup form without having entered
		// anything do not show error messages, think going to click log in.
		if ( data.username.length === 0 && data.password.length === 0 && data.email.length === 0 ) {
			return;
		}
		this.formStateController.sanitize();
		this.formStateController.validate();
		this.props.save && this.props.save( this.state.form );
	};

	handleSubmit = event => {
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

			const analyticsData = {
				unique_usernames_searched: usernamesSearched.length,
				times_username_validation_failed: timesUsernameValidationFailed,
				times_password_validation_failed: timesPasswordValidationFailed,
			};

			this.props.submitForm( this.state.form, this.getUserData(), analyticsData );

			resetAnalyticsData();
		} );
	};

	getLoginLink() {
		return login( {
			isJetpack: 'jetpack-connect' === this.props.sectionName,
			isNative: config.isEnabled( 'login/native-login-links' ),
			redirectTo: this.props.redirectToAfterLoginUrl,
			locale: this.props.locale,
			oauth2ClientId: this.props.oauth2Client && this.props.oauth2Client.id,
		} );
	}

	getNoticeMessageWithLogin( notice ) {
		const link = this.getLoginLink();

		if ( notice.error === '2FA_enabled' ) {
			return (
				<span>
					<p>
						{ notice.message }&nbsp;
						{ this.props.translate( '{{a}}Log in now{{/a}} to finish signing up.', {
							components: {
								a: <a href={ link } onClick={ this.props.trackLoginMidFlow } />,
							},
						} ) }
					</p>
				</span>
			);
		}
		return notice.message;
	}

	globalNotice( notice ) {
		return (
			<Notice
				className="signup-form__notice"
				showDismiss={ false }
				status={ notices.getStatusHelper( notice ) }
				text={ this.getNoticeMessageWithLogin( notice ) }
			/>
		);
	}

	getUserData() {
		return {
			username: formState.getFieldValue( this.state.form, 'username' ),
			password: formState.getFieldValue( this.state.form, 'password' ),
			email: formState.getFieldValue( this.state.form, 'email' ),
		};
	}

	getErrorMessagesWithLogin( fieldName ) {
		const messages = formState.getFieldErrorMessages( this.state.form, fieldName );
		if ( ! messages ) {
			return;
		}

		let link = this.getLoginLink();

		return map( messages, ( message, error_code ) => {
			if ( error_code === 'taken' ) {
				link +=
					'&email_address=' +
					encodeURIComponent( formState.getFieldValue( this.state.form, fieldName ) );
				return (
					<span>
						<p>
							{ message }&nbsp;
							{ this.props.translate( 'If this is you {{a}}log in now{{/a}}.', {
								components: {
									a: <a href={ link } onClick={ this.props.trackLoginMidFlow } />,
								},
							} ) }
						</p>
					</span>
				);
			}
			return message;
		} );
	}

	formFields() {
		const isEmailValid =
			! this.props.disableEmailInput && formState.isFieldValid( this.state.form, 'email' );

		return (
			<div>
				<FormLabel htmlFor="email">{ this.props.translate( 'Your email address' ) }</FormLabel>
				<FormTextInput
					autoFocus={ ! this.props.isSocialSignupEnabled }
					autoCapitalize="off"
					autoCorrect="off"
					className="signup-form__input"
					disabled={
						this.state.submitting || !! this.props.disabled || !! this.props.disableEmailInput
					}
					id="email"
					name="email"
					type="email"
					value={ formState.getFieldValue( this.state.form, 'email' ) }
					isError={ formState.isFieldInvalid( this.state.form, 'email' ) }
					isValid={ this.state.validationInitialized && isEmailValid }
					onBlur={ this.handleBlur }
					onChange={ this.handleChangeEvent }
				/>
				{ this.emailDisableExplanation() }

				{ formState.isFieldInvalid( this.state.form, 'email' ) && (
					<FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'email' ) } />
				) }

				<FormLabel htmlFor="username">{ this.props.translate( 'Choose a username' ) }</FormLabel>
				<FormTextInput
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
					onChange={ this.handleChangeEvent }
				/>

				{ formState.isFieldInvalid( this.state.form, 'username' ) && (
					<FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'username' ) } />
				) }

				<FormLabel htmlFor="password">{ this.props.translate( 'Choose a password' ) }</FormLabel>
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
					submitting={ this.state.submitting || this.props.submitting }
				/>
				{ this.passwordValidationExplanation() }
			</div>
		);
	}

	handleOnClickTos = () => {
		analytics.tracks.recordEvent.bind( analytics, 'calypso_signup_tos_link_click' );
	};

	getTermsOfServiceUrl() {
		// locales where we don't have translated TOS will simply show the English one
		return 'https://' + i18n.getLocaleSlug() + '.wordpress.com/tos/';
	}

	termsOfServiceLink() {
		const tosLink = (
			<a
				href={ this.getTermsOfServiceUrl() }
				onClick={ this.handleOnClickTos }
				target="_blank"
				rel="noopener noreferrer"
			/>
		);
		const tosText = this.props.translate(
			'By creating an account you agree to our {{a}}fascinating Terms of Service{{/a}}.',
			{
				components: {
					a: tosLink,
				},
			}
		);

		if ( this.props.isSocialSignupEnabled ) {
			return (
				<p className="signup-form__terms-of-service-link">
					{ this.props.translate(
						'By creating an account via any of the options below, you agree to our {{a}}Terms of Service{{/a}}.',
						{
							components: {
								a: tosLink,
							},
						}
					) }
				</p>
			);
		}

		return <p className="signup-form__terms-of-service-link">{ tosText }</p>;
	}

	getNotice() {
		if ( this.props.step && 'invalid' === this.props.step.status ) {
			return this.globalNotice( this.props.step.errors[ 0 ] );
		}
		if ( this.state.notice ) {
			return this.globalNotice( this.state.notice );
		}
		return false;
	}

	emailDisableExplanation() {
		if ( this.props.disableEmailInput && this.props.disableEmailExplanation ) {
			return (
				<FormSettingExplanation noValidate={ true }>
					{ this.props.disableEmailExplanation }
				</FormSettingExplanation>
			);
		}
	}

	passwordValidationExplanation() {
		const passwordValue = formState.getFieldValue( this.state.form, 'password' );

		if ( formState.isFieldInvalid( this.state.form, 'password' ) ) {
			return <FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'password' ) } />;
		}

		if ( passwordValue && passwordValue < 6 ) {
			return (
				<FormSettingExplanation>
					{ this.props.translate( 'Your password must be at least six characters long.' ) }
				</FormSettingExplanation>
			);
		}

		return false;
	}

	formFooter() {
		return (
			<LoggedOutFormFooter isBlended={ this.props.isSocialSignupEnabled }>
				{ this.termsOfServiceLink() }
				<FormButton
					className="signup-form__submit"
					disabled={ this.state.submitting || this.props.disabled }
				>
					{ this.props.submitButtonText }
				</FormButton>
			</LoggedOutFormFooter>
		);
	}

	footerLink() {
		if ( this.props.positionInFlow !== 0 ) {
			return;
		}

		const logInUrl = config.isEnabled( 'login/native-login-links' )
			? this.getLoginLink()
			: addLocaleToWpcomUrl( config( 'login_url' ), this.props.locale );

		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ logInUrl }>
					{ this.props.translate( 'Already have a WordPress.com account? Log in now.' ) }
				</LoggedOutFormLinkItem>
				{ this.props.oauth2Client && (
					<LoggedOutFormBackLink
						oauth2Client={ this.props.oauth2Client }
						recordClick={ this.recordBackLinkClick }
					/>
				) }
			</LoggedOutFormLinks>
		);
	}

	render() {
		if ( this.getUserExistsError( this.props ) ) {
			return null;
		}

		return (
			<div className={ classNames( 'signup-form', this.props.className ) }>
				{ this.getNotice() }

				<LoggedOutForm onSubmit={ this.handleSubmit } noValidate={ true }>
					{ this.props.formHeader && (
						<header className="signup-form__header">{ this.props.formHeader }</header>
					) }

					{ this.formFields() }

					{ this.props.formFooter || this.formFooter() }
				</LoggedOutForm>

				{ this.props.isSocialSignupEnabled && (
					<SocialSignupForm
						handleResponse={ this.props.handleSocialResponse }
						socialService={ this.props.socialService }
						socialServiceResponse={ this.props.socialServiceResponse }
					/>
				) }

				{ this.props.footerLink || this.footerLink() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		oauth2Client: getCurrentOAuth2Client( state ),
		sectionName: getSectionName( state ),
	} ),
	{
		trackLoginMidFlow: () => recordTracksEvent( 'calypso_signup_login_midflow' ),
		createSocialUserFailed,
	}
)( localize( SignupForm ) );
