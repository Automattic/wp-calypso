import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { FormInputValidation, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Spinner, TextControl } from '@wordpress/components';
import clsx from 'clsx';
import debugModule from 'debug';
import { localize } from 'i18n-calypso';
import {
	camelCase,
	find,
	filter,
	forEach,
	get,
	includes,
	keys,
	map,
	mapKeys,
	merge,
	pick,
	omitBy,
	snakeCase,
	isEmpty,
} from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { FormDivider } from 'calypso/blocks/authentication';
import ContinueAsUser from 'calypso/blocks/login/continue-as-user';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LoggedOutForm from 'calypso/components/logged-out-form';
import LoggedOutFormFooter from 'calypso/components/logged-out-form/footer';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import Notice from 'calypso/components/notice';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import formState from 'calypso/lib/form-state';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { isCrowdsignalOAuth2Client, isGravatarOAuth2Client } from 'calypso/lib/oauth2-clients';
import { login, lostPassword } from 'calypso/lib/paths';
import { isExistingAccountError } from 'calypso/lib/signup/is-existing-account-error';
import { addQueryArgs } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import ValidationFieldset from 'calypso/signup/validation-fieldset';
import { recordTracksEventWithClientId } from 'calypso/state/analytics/actions';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { createSocialUserFailed } from 'calypso/state/login/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWoo from 'calypso/state/selectors/get-is-woo';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import { resetSignup } from 'calypso/state/signup/actions';
import { getSectionName } from 'calypso/state/ui/selectors';
import CrowdsignalSignupForm from './crowdsignal';
import PasswordlessSignupForm from './passwordless';
import SignupFormSocialFirst from './signup-form-social-first';
import SignupSubmitButton from './signup-submit-button';
import SocialSignupForm from './social';

import './style.scss';

const VALIDATION_DELAY_AFTER_FIELD_CHANGES = 2000;
const debug = debugModule( 'calypso:signup-form:form' );

let usernamesSearched = [];
let timesUsernameValidationFailed = 0;
let timesPasswordValidationFailed = 0;
let timesEmailValidationFailed = 0;

const resetAnalyticsData = () => {
	usernamesSearched = [];
	timesUsernameValidationFailed = 0;
	timesPasswordValidationFailed = 0;
	timesEmailValidationFailed = 0;
};

class SignupForm extends Component {
	static propTypes = {
		className: PropTypes.string,
		disableBlurValidation: PropTypes.bool,
		disableContinueAsUser: PropTypes.bool,
		disabled: PropTypes.bool,
		disableEmailExplanation: PropTypes.string,
		disableEmailInput: PropTypes.bool,
		disableSubmitButton: PropTypes.bool,
		displayNameInput: PropTypes.bool,
		displayUsernameInput: PropTypes.bool,
		email: PropTypes.string,
		flowName: PropTypes.string,
		footerLink: PropTypes.node,
		formHeader: PropTypes.node,
		goToNextStep: PropTypes.func,
		handleCreateAccountError: PropTypes.func,
		handleCreateAccountSuccess: PropTypes.func,
		handleLogin: PropTypes.func,
		handleSocialResponse: PropTypes.func,
		horizontal: PropTypes.bool,
		isPasswordless: PropTypes.bool,
		isSocialFirst: PropTypes.bool,
		isSocialSignupEnabled: PropTypes.bool,
		locale: PropTypes.string,
		positionInFlow: PropTypes.number,
		redirectToAfterLoginUrl: PropTypes.string,
		save: PropTypes.func,
		shouldDisplayUserExistsError: PropTypes.bool,
		signupDependencies: PropTypes.object,
		step: PropTypes.object,
		submitButtonLabel: PropTypes.string,
		submitButtonLoadingLabel: PropTypes.string,
		submitButtonText: PropTypes.string,
		submitForm: PropTypes.func,
		submitting: PropTypes.bool,
		suggestedUsername: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		disableTosText: PropTypes.bool,

		// Connected props
		oauth2Client: PropTypes.object,
		sectionName: PropTypes.string,
	};

	static defaultProps = {
		displayNameInput: false,
		displayUsernameInput: true,
		flowName: '',
		isPasswordless: false,
		isSocialSignupEnabled: false,
		isSocialFirst: false,
		horizontal: false,
		shouldDisplayUserExistsError: false,
	};

	constructor( props ) {
		super( props );

		this.formStateController = new formState.Controller( {
			initialFields: {
				firstName: '',
				lastName: '',
				email: this.props.email || '',
				username: '',
				password: '',
			},
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
			debounceWait: VALIDATION_DELAY_AFTER_FIELD_CHANGES,
			hideFieldErrorsOnChange: true,
			initialState: this.props.step ? this.props.step.form : undefined,
			skipSanitizeAndValidateOnFieldChange: true,
		} );

		const initialState = this.formStateController.getInitialState();
		const stateWithFilledUsername = this.autoFillUsername( initialState );

		this.state = {
			submitting: false,
			isFieldDirty: {
				email: false,
				username: false,
				password: false,
				firstName: false,
				lastName: false,
			},
			form: stateWithFilledUsername,
			validationInitialized: false,
			emailErrorMessage: '',
		};
	}

	componentDidMount() {
		debug( 'Mounted the SignupForm React component.' );

		this.maybeRedirectToSocialConnect();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.step?.status === 'processing' && nextProps.step?.status === 'invalid' ) {
			this.setState( {
				submitting: false,
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.step && this.props.step && prevProps.step.status !== this.props.step.status ) {
			this.maybeRedirectToSocialConnect();
		}
	}

	autoFillUsername( form ) {
		if ( formState.getFieldValue( form, 'username' ) ) {
			return form;
		}

		const value = this.props.suggestedUsername || '';
		return merge( form, { username: { value } } );
	}

	recordBackLinkClick = () => {
		recordTracksEvent( 'calypso_signup_back_link_click' );
	};

	getUserExistsError( props ) {
		const { step } = props;

		if ( ! step || step.status !== 'invalid' ) {
			return null;
		}

		const userExistsError = find( step.errors, ( error ) => error.error === 'user_exists' );

		return userExistsError;
	}

	/**
	 * If the step is invalid because we had an error that the user exists,
	 * we should prompt user with a request to connect their social account
	 * to their existing WPCOM account.
	 *
	 * That can be done either by redirecting or only suggesting. If it's done
	 * by suggesting, bail out of redirecting and display the error.
	 */
	maybeRedirectToSocialConnect() {
		if ( this.props.shouldDisplayUserExistsError ) {
			return;
		}

		const userExistsError = this.getUserExistsError( this.props );
		if ( userExistsError ) {
			const { service, id_token, access_token } = this.props.step;
			const socialInfo = { service, id_token, access_token };

			this.props.createSocialUserFailed( socialInfo, userExistsError, 'signup' );

			// Reset the signup step so that we don't re trigger this logic when the user goes back from login screen.
			this.props.resetSignup();

			const loginLink = this.getLoginLink( { emailAddress: userExistsError.email } );
			page(
				addQueryArgs(
					{
						service: this.props.step?.service,
						access_token: this.props.step?.access_token,
						id_token: this.props.step?.id_token,
					},
					loginLink
				)
			);
		}
	}

	sanitizeEmail( email ) {
		return email && email.replace( /\s+/g, '' ).toLowerCase();
	}

	sanitizeUsername( username ) {
		return username && username.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase();
	}

	sanitize = ( fields, onComplete ) => {
		const sanitizedEmail = this.sanitizeEmail( fields.email );
		const sanitizedUsername = this.sanitizeUsername( fields.username );

		if ( fields.email !== sanitizedEmail || fields.username !== sanitizedUsername ) {
			const sanitizedFormValues = Object.assign( fields, {
				email: sanitizedEmail,
				username: sanitizedUsername,
			} );
			onComplete( sanitizedFormValues );
		}
	};

	filterUntouchedFieldErrors = ( errorMessages ) => {
		// Filter out "field is empty" error messages unless the field is 'dirty' (it has been interacted with).
		return omitBy(
			errorMessages,
			( value, key ) => value.hasOwnProperty( 'argument' ) && ! this.state.isFieldDirty[ key ]
		);
	};

	validate = ( fields, onComplete ) => {
		const fieldsForValidation = filter( [
			'email',
			this.props.isPasswordless === false && 'password', // Remove password from validation if passwordless
			this.displayUsernameInput() && 'username',
			this.props.displayNameInput && 'firstName',
			this.props.displayNameInput && 'lastName',
		] );

		const data = mapKeys( pick( fields, fieldsForValidation ), ( value, key ) => snakeCase( key ) );
		wpcom.req.post(
			'/signups/validation/user',
			{
				...data,
				locale: getLocaleSlug(),
			},
			( error, response ) => {
				if ( this.props.submitting ) {
					// this is a stale callback, we have already signed up or are logging in
					return;
				}

				if ( error || ! response ) {
					return debug( error || 'User validation failed.' );
				}

				let messages = response.success
					? {}
					: mapKeys( response.messages, ( value, key ) => camelCase( key ) );

				// Prevent "field is empty" error messages from displaying prematurely
				// before the form has been submitted or before the field has been interacted with (is dirty).
				if ( ! this.state.submitting ) {
					messages = this.filterUntouchedFieldErrors( messages );
				}

				forEach( messages, ( fieldError, field ) => {
					if ( ! formState.isFieldInvalid( this.state.form, field ) ) {
						return;
					}

					if ( field === 'username' && ! includes( usernamesSearched, fields.username ) ) {
						recordTracksEvent( 'calypso_signup_username_validation_failed', {
							error: keys( fieldError )[ 0 ],
							username: fields.username,
						} );

						timesUsernameValidationFailed++;
					}

					if ( field === 'password' ) {
						recordTracksEvent( 'calypso_signup_password_validation_failed', {
							error: keys( fieldError )[ 0 ],
						} );

						timesPasswordValidationFailed++;
					}

					if ( field === 'email' ) {
						recordTracksEvent( 'calypso_signup_email_validation_failed', {
							error: keys( fieldError )[ 0 ],
							email: fields.email,
						} );

						timesEmailValidationFailed++;
					}
				} );

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

					if ( this.props.isWoo && ! fields.email.includes( '@' ) ) {
						messages = Object.assign( {}, messages, {
							email: {
								invalid: this.props.translate(
									'This email address is not valid. It must include a single @'
								),
							},
						} );
					}
				}

				onComplete( error, messages );
				if ( ! this.state.validationInitialized ) {
					this.setState( { validationInitialized: true } );
				}
			}
		);
	};

	setFormState = ( state ) => {
		this.setState( { form: state } );
	};

	handleLoginClick = ( event, fieldValue ) => {
		this.props.trackLoginMidFlow( event );
		if ( this.props.handleLogin ) {
			event.preventDefault();
			this.props.handleLogin( fieldValue );
		}
	};

	handleFormControllerError( error ) {
		if ( error ) {
			throw error;
		}
	}

	handleChangeEvent = ( event ) => {
		const name = event.target.name;
		const value = event.target.value;

		this.formStateController.handleFieldChange( {
			name: name,
			value: value,
		} );
	};

	handleBlur = ( event ) => {
		if ( this.props.disableBlurValidation ) {
			return;
		}

		const fieldId = event.target.id;
		this.setState( {
			isFieldDirty: { ...this.state.isFieldDirty, [ fieldId ]: true },
			submitting: false,
		} );

		this.validateAndSaveForm();
	};

	validateAndSaveForm = () => {
		const data = this.getUserData();

		// When a user moves away from the signup form without having entered
		// anything do not show error messages, think going to click log in.
		// we do data.username?.length because username can be undefined when the username field isn't used
		if ( ! data.username?.length && data.password.length === 0 && data.email.length === 0 ) {
			return;
		}

		this.formStateController.sanitize();
		this.formStateController.validate();
		this.props.save && this.props.save( this.state.form );
	};

	handleSubmit = ( event ) => {
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

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				this.setState( { submitting: false } );
				return;
			}

			const analyticsData = {
				unique_usernames_searched: usernamesSearched.length,
				times_username_validation_failed: timesUsernameValidationFailed,
				times_password_validation_failed: timesPasswordValidationFailed,
				times_email_validation_failed: timesEmailValidationFailed,
			};

			this.props.submitForm( this.state.form, this.getUserData(), analyticsData, () => {
				this.setState( { submitting: false } );
			} );

			resetAnalyticsData();
		} );
	};

	isJetpack() {
		return 'jetpack-connect' === this.props.sectionName;
	}

	getLoginLinkFrom() {
		return this.props.from;
	}

	getLoginLink( { emailAddress } = {} ) {
		return login( {
			emailAddress,
			isJetpack: this.isJetpack(),
			from: this.props.from,
			redirectTo: this.props.redirectToAfterLoginUrl,
			locale: this.props.locale,
			oauth2ClientId: this.props.oauth2Client && this.props.oauth2Client.id,
			wccomFrom: this.props.wccomFrom,
			signupUrl: window.location.pathname + window.location.search,
		} );
	}

	getNoticeMessageWithLogin( notice ) {
		if ( notice.error === '2FA_enabled' ) {
			return (
				<span>
					<p>
						{ notice.message }
						&nbsp;
						{ this.props.translate( '{{a}}Log in now{{/a}} to finish signing up.', {
							components: {
								a: <a href={ this.getLoginLink() } onClick={ this.props.trackLoginMidFlow } />,
							},
						} ) }
					</p>
				</span>
			);
		}
		return notice.message;
	}

	globalNotice( notice, status ) {
		return (
			<Notice
				className={ clsx( 'signup-form__notice', {
					'signup-form__span-columns': this.isHorizontal(),
				} ) }
				showDismiss={ false }
				status={ status }
				text={ this.getNoticeMessageWithLogin( notice ) }
			/>
		);
	}

	getUserNameHint() {
		const email = formState.getFieldValue( this.state.form, 'email' );
		const emailIdentifier = email.match( /^(.*?)@/ );
		return emailIdentifier && emailIdentifier[ 1 ];
	}

	getUserData() {
		const userData = {
			password: formState.getFieldValue( this.state.form, 'password' ),
			email: formState.getFieldValue( this.state.form, 'email' ),
		};

		if ( this.props.displayNameInput ) {
			userData.extra = {
				first_name: formState.getFieldValue( this.state.form, 'firstName' ),
				last_name: formState.getFieldValue( this.state.form, 'lastName' ),
			};
		}

		if ( this.displayUsernameInput() ) {
			userData.username = formState.getFieldValue( this.state.form, 'username' );
		} else {
			userData.extra = {
				...userData.extra,
				username_hint: this.getUserNameHint(),
			};
		}

		return userData;
	}

	getErrorMessagesWithLogin( fieldName ) {
		const messages = formState.getFieldErrorMessages( this.state.form, fieldName );
		if ( ! messages ) {
			return;
		}

		return map( messages, ( message, error_code ) => {
			if ( error_code === 'taken' ) {
				const fieldValue = formState.getFieldValue( this.state.form, fieldName );
				const link = addQueryArgs( { email_address: fieldValue }, this.getLoginLink() );
				const lostPasswordLink = lostPassword( this.props.locale );

				return (
					<span key={ error_code }>
						<p>
							{ message }
							&nbsp;
							{ this.props.translate(
								'{{loginLink}}Log in{{/loginLink}} or {{pwdResetLink}}reset your password{{/pwdResetLink}}.',
								{
									components: {
										loginLink: (
											<a
												href={ link }
												onClick={ ( event ) => this.handleLoginClick( event, fieldValue ) }
											/>
										),
										pwdResetLink: (
											<a
												href={ lostPasswordLink }
												onClick={ ( event ) => {
													event.preventDefault();
													recordTracksEvent( 'calypso_signup_reset_password_link_click' );
													page(
														login( {
															redirectTo: this.props.redirectToAfterLoginUrl,
															locale: this.props.locale,
															action: this.props.isWooJPC ? 'jetpack/lostpassword' : 'lostpassword',
															oauth2ClientId: this.props.oauth2Client && this.props.oauth2Client.id,
															from: this.props.from,
														} )
													);
												} }
											/>
										),
									},
								}
							) }
						</p>
					</span>
				);
			}
			return message;
		} );
	}

	displayUsernameInput() {
		return this.props.displayUsernameInput && ! this.props.isBlazePro;
	}

	formFields() {
		const isEmailValid =
			! this.props.disableEmailInput && formState.isFieldValid( this.state.form, 'email' );

		return (
			<div>
				{ this.props.displayNameInput && (
					<>
						<FormLabel htmlFor="firstName">{ this.props.translate( 'Your first name' ) }</FormLabel>
						<FormTextInput
							autoCorrect="off"
							className="signup-form__input"
							disabled={ this.state.submitting || !! this.props.disabled }
							id="firstName"
							name="firstName"
							value={ formState.getFieldValue( this.state.form, 'firstName' ) }
							isError={ formState.isFieldInvalid( this.state.form, 'firstName' ) }
							isValid={ formState.isFieldValid( this.state.form, 'firstName' ) }
							onBlur={ this.handleBlur }
							onChange={ this.handleChangeEvent }
						/>

						{ formState.isFieldInvalid( this.state.form, 'firstName' ) && (
							<FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'firstName' ) } />
						) }

						<FormLabel htmlFor="lastName">{ this.props.translate( 'Your last name' ) }</FormLabel>
						<FormTextInput
							autoCorrect="off"
							className="signup-form__input"
							disabled={ this.state.submitting || !! this.props.disabled }
							id="lastName"
							name="lastName"
							value={ formState.getFieldValue( this.state.form, 'lastName' ) }
							isError={ formState.isFieldInvalid( this.state.form, 'lastName' ) }
							isValid={ formState.isFieldValid( this.state.form, 'lastName' ) }
							onBlur={ this.handleBlur }
							onChange={ this.handleChangeEvent }
						/>

						{ formState.isFieldInvalid( this.state.form, 'lastName' ) && (
							<FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'lastName' ) } />
						) }
					</>
				) }

				<FormLabel htmlFor="email">{ this.props.translate( 'Your email address' ) }</FormLabel>
				<FormTextInput
					autoCapitalize="off"
					autoCorrect="off"
					className="signup-form__input"
					disabled={
						this.state.submitting || !! this.props.disabled || !! this.props.disableEmailInput
					}
					id="email"
					name="email"
					type="email"
					value={ this.getEmailValue() }
					isError={ formState.isFieldInvalid( this.state.form, 'email' ) }
					isValid={ this.state.validationInitialized && isEmailValid }
					onBlur={ this.handleBlur }
					onChange={ this.handleChangeEvent }
				/>
				{ this.emailDisableExplanation() }

				{ formState.isFieldInvalid( this.state.form, 'email' ) && (
					<FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'email' ) } />
				) }

				{ this.displayUsernameInput() && (
					<>
						<FormLabel htmlFor="username">
							{ this.props.isWoo && ! this.props.isWooJPC
								? this.props.translate( 'Username' )
								: this.props.translate( 'Choose a username' ) }
						</FormLabel>
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
					</>
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

	recordWooCommerceSignupTracks( method ) {
		const { isWoo, wccomFrom } = this.props;
		if ( isWoo && 'cart' === wccomFrom ) {
			recordTracksEvent( 'wcadmin_storeprofiler_payment_create_account', {
				signup_method: method,
			} );
		}
	}

	handleWooCommerceSocialConnect = ( ...args ) => {
		this.recordWooCommerceSignupTracks( 'social' );
		this.props.handleSocialResponse( ...args );
	};

	handleWooCommerceSubmit = ( event ) => {
		event.preventDefault();
		document.activeElement.blur();
		this.recordWooCommerceSignupTracks( 'email' );

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				this.setState( { submitting: false } );
				return;
			}
		} );
		this.handleSubmit( event );
	};

	handlePasswordlessSubmit = ( passwordLessData ) => {
		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				this.setState( { submitting: false } );
				return;
			}
			this.props.submitForm( this.state.form, passwordLessData );
		} );
	};

	renderWooCommerce() {
		return (
			<div className="signup-form__woocommerce-inputs-wrapper">
				<TextControl
					label={ this.props.translate( 'Your email address' ) }
					disabled={
						this.state.submitting || !! this.props.disabled || !! this.props.disableEmailInput
					}
					id="email"
					name="email"
					type="email"
					value={ formState.getFieldValue( this.state.form, 'email' ) }
					onBlur={ this.handleBlur }
					onChange={ ( value ) => {
						this.formStateController.handleFieldChange( {
							name: 'email',
							value,
						} );
					} }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{ this.emailDisableExplanation() }

				{ formState.isFieldInvalid( this.state.form, 'email' ) && (
					<FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'email' ) } />
				) }

				{ this.props.displayUsernameInput && (
					<>
						<TextControl
							label={ this.props.translate( 'Choose a username' ) }
							disabled={ this.state.submitting || this.props.disabled }
							id="username"
							name="username"
							value={ formState.getFieldValue( this.state.form, 'username' ) }
							onBlur={ this.handleBlur }
							onChange={ ( value ) => {
								this.formStateController.handleFieldChange( {
									name: 'username',
									value,
								} );
							} }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>

						{ formState.isFieldInvalid( this.state.form, 'username' ) && (
							<FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'username' ) } />
						) }
					</>
				) }

				<TextControl
					label={ this.props.translate( 'Choose a password' ) }
					disabled={ this.state.submitting || this.props.disabled }
					id="password"
					name="password"
					type="password"
					value={ formState.getFieldValue( this.state.form, 'password' ) }
					onBlur={ this.handleBlur }
					onChange={ ( value ) => {
						this.formStateController.handleFieldChange( {
							name: 'password',
							value,
						} );
					} }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>

				{ this.passwordValidationExplanation() }

				{ this.props.formFooter || this.formFooter() }
			</div>
		);
	}

	handleTosClick = () => {
		recordTracksEvent( 'calypso_signup_tos_link_click' );
	};

	handlePrivacyClick = () => {
		recordTracksEvent( 'calypso_signup_privacy_link_click' );
	};

	termsOfServiceLink = () => {
		if ( this.props.isWoo ) {
			return null;
		}

		const options = {
			components: {
				tosLink: (
					<a
						href={ localizeUrl( 'https://wordpress.com/tos/' ) }
						onClick={ this.handleTosClick }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				privacyLink: (
					<a
						href={ localizeUrl( 'https://automattic.com/privacy/' ) }
						onClick={ this.handlePrivacyClick }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		};
		let tosText = this.props.translate(
			'By creating an account you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
			options
		);

		if ( this.props.isGravatar ) {
			tosText = this.props.translate(
				'By entering your email address, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
				options
			);
		}

		if ( this.props.isBlazePro ) {
			tosText = (
				<>
					{ this.props.translate(
						'By creating an account, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and acknowledge you have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
						options
					) }{ ' ' }
					{ this.props.translate(
						'Blaze Pro uses WordPress.com accounts under the hood. Tumblr, Blaze Pro, and WordPress.com are properties of Automattic, Inc.'
					) }
				</>
			);
		}

		return <p className="signup-form__terms-of-service-link">{ tosText }</p>;
	};

	getNotice( isSocialFirst = false ) {
		const userExistsError = this.getUserExistsError( this.props );

		if ( userExistsError ) {
			const loginLink = this.getLoginLink( { emailAddress: userExistsError.email } );
			return this.globalNotice(
				{
					message: this.props.translate(
						'We found a WordPress.com account with the email "%(email)s". ' +
							'{{a}}Log in to connect it{{/a}}, or use a different email to sign up.',
						{
							args: { email: userExistsError.email },
							components: {
								a: (
									<a
										href={ loginLink }
										onClick={ ( event ) => {
											event.preventDefault();
											recordTracksEvent( 'calypso_signup_social_existing_user_login_link_click' );
											page(
												addQueryArgs(
													{
														service: this.props.step?.service,
														access_token: this.props.step?.access_token,
														id_token: this.props.step?.id_token,
													},
													loginLink
												)
											);
										} }
									/>
								),
							},
						}
					),
				},
				isSocialFirst ? 'is-transparent-info' : 'is-info'
			);
		}

		if ( this.props.step && 'invalid' === this.props.step.status ) {
			return this.globalNotice( this.props.step.errors[ 0 ], 'is-error' );
		}

		return false;
	}

	emailDisableExplanation() {
		if ( this.props.disableEmailInput && this.props.disableEmailExplanation ) {
			return (
				<FormSettingExplanation>{ this.props.disableEmailExplanation }</FormSettingExplanation>
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

	hasFilledInputValues = () => {
		const userInputFields = [ 'email', 'username', 'password' ];
		return userInputFields.every( ( field ) => {
			const value = formState.getFieldValue( this.state.form, field );
			if ( typeof value === 'string' ) {
				return value.trim().length > 0;
			}
			// eslint-disable-next-line no-console
			console.warn(
				`hasFilledInputValues: field ${ field } has a value of type ${ typeof value }. Expected string.`
			);
			// If we can't determine if the field is filled, we assume it is so that the user can submit the form.
			return true;
		} );
	};

	formFooter() {
		const params = new URLSearchParams( window.location.search );
		const variationName = params.get( 'variationName' );

		return (
			<LoggedOutFormFooter isBlended={ this.props.isSocialSignupEnabled }>
				{ ! this.props.disableTosText && this.termsOfServiceLink() }
				<SignupSubmitButton
					isDisabled={
						this.state.submitting ||
						this.props.disabled ||
						this.props.disableSubmitButton ||
						( this.props.isWoo &&
							( ! this.hasFilledInputValues() || formState.hasErrors( this.state.form ) ) )
					}
					variationName={ variationName }
				>
					{ this.props.submitButtonText }
				</SignupSubmitButton>
			</LoggedOutFormFooter>
		);
	}

	footerLink() {
		const { isWoo, isBlazePro } = this.props;

		if ( isWoo ) {
			return null;
		}

		if ( isBlazePro ) {
			return (
				<p className="signup-form__login-link">
					{ this.props.translate( 'Already have an account? {{link}}Log in here{{/link}}.', {
						components: { link: <a href={ this.getLoginLink() } /> },
					} ) }
				</p>
			);
		}

		return null;
	}

	handleOnChangeAccount = () => {
		recordTracksEvent( 'calypso_signup_click_on_change_account' );
		this.props.redirectToLogout( window.location.href );
	};

	isHorizontal = () => {
		return this.props.horizontal;
	};

	getEmailValue = () => {
		return isEmpty( formState.getFieldValue( this.state.form, 'email' ) )
			? this.props.queryArgs?.user_email
			: formState.getFieldValue( this.state.form, 'email' );
	};

	handleCreateAccountError = ( error, email ) => {
		if ( this.props.handleCreateAccountError ) {
			return this.props.handleCreateAccountError( error, email );
		}

		if ( isExistingAccountError( error.error ) ) {
			page(
				addQueryArgs(
					{
						email_address: email,
						is_signup_existing_account: true,
					},
					this.getLoginLink()
				)
			);
		}
	};

	render() {
		if ( this.getUserExistsError( this.props ) && ! this.props.shouldDisplayUserExistsError ) {
			return null;
		}

		if ( this.props.currentUser && ! this.props.disableContinueAsUser ) {
			return (
				<ContinueAsUser
					currentUser={ this.props.currentUser }
					onChangeAccount={ this.handleOnChangeAccount }
					redirectPath={ this.props.redirectToAfterLoginUrl }
					isWoo={ this.props.isWoo }
					isBlazePro={ this.props.isBlazePro }
				/>
			);
		}

		if ( isCrowdsignalOAuth2Client( this.props.oauth2Client ) ) {
			const socialProps = pick( this.props, [
				'isSocialSignupEnabled',
				'handleSocialResponse',
				'socialServiceResponse',
			] );

			return (
				<CrowdsignalSignupForm
					disabled={ this.props.disabled }
					formFields={ this.formFields() }
					handleSubmit={ this.handleSubmit }
					loginLink={ this.getLoginLink() }
					oauth2Client={ this.props.oauth2Client }
					recordBackLinkClick={ this.recordBackLinkClick }
					submitting={ this.props.submitting }
					{ ...socialProps }
				/>
			);
		}

		if ( this.props.isJetpackWooDnaFlow ) {
			return (
				<div className={ clsx( 'signup-form__woocommerce', this.props.className ) }>
					<LoggedOutForm onSubmit={ this.handleWooCommerceSubmit } noValidate>
						{ this.props.formHeader && (
							<header className="signup-form__header">{ this.props.formHeader }</header>
						) }

						{ this.renderWooCommerce() }

						{ this.props.isSocialSignupEnabled && (
							<SocialSignupForm
								handleResponse={ this.handleWooCommerceSocialConnect }
								socialServiceResponse={ this.props.socialServiceResponse }
								redirectToAfterLoginUrl={ this.props.redirectToAfterLoginUrl }
							/>
						) }
					</LoggedOutForm>

					{ this.props.footerLink || (
						<LoggedOutFormLinkItem href={ this.getLoginLink() }>
							{ this.props.translate( 'Log in with an existing WordPress.com account' ) }
						</LoggedOutFormLinkItem>
					) }
				</div>
			);
		}

		const logInUrl = this.getLoginLink();

		if ( this.props.isSocialFirst ) {
			return (
				<SignupFormSocialFirst
					stepName={ this.props.stepName }
					flowName={ this.props.flowName }
					goToNextStep={ this.props.goToNextStep }
					logInUrl={ logInUrl }
					handleSocialResponse={ this.props.handleSocialResponse }
					socialServiceResponse={ this.props.socialServiceResponse }
					redirectToAfterLoginUrl={ this.props.redirectToAfterLoginUrl }
					queryArgs={ this.props.queryArgs }
					userEmail={ this.getEmailValue() }
					notice={ this.getNotice( true ) }
					isSocialFirst={ this.props.isSocialFirst }
				/>
			);
		}

		const isGravatar = this.props.isGravatar;
		const emailErrorMessage = this.getErrorMessagesWithLogin( 'email' );
		const showSeparator =
			'wpcc' !== this.props.flowName &&
			( ( ! config.isEnabled( 'desktop' ) && this.isHorizontal() ) || this.props.isWoo );

		if (
			( this.props.isPasswordless && ( 'wpcc' !== this.props.flowName || this.props.isWoo ) ) ||
			isGravatar
		) {
			let formProps = {
				submitButtonLabel: this.props.submitButtonLabel,
				submitButtonLoadingLabel: this.props.submitButtonLoadingLabel,
			};

			switch ( true ) {
				case isGravatar:
					formProps = {
						inputPlaceholder: this.props.translate( 'Enter your email address' ),
						submitButtonLabel: this.props.translate( 'Continue' ),
						submitButtonLoadingLabel: this.props.translate( 'Continue' ),
					};
					break;
				case this.props.isWoo:
					formProps = {
						inputPlaceholder: null,
						submitButtonLabel: this.props.translate( 'Continue' ),
						submitButtonLoadingLabel: <Spinner />,
					};
			}

			return (
				<div
					className={ clsx( 'signup-form', this.props.className, {
						'is-horizontal': this.isHorizontal(),
					} ) }
				>
					{ this.getNotice() }
					<PasswordlessSignupForm
						stepName={ this.props.stepName }
						flowName={ this.props.flowName }
						goToNextStep={ this.props.goToNextStep }
						renderTerms={ this.termsOfServiceLink }
						disableTosText={ this.props.disableTosText }
						submitForm={ this.handlePasswordlessSubmit }
						logInUrl={ logInUrl }
						disabled={ this.props.disabled }
						disableSubmitButton={ this.props.disableSubmitButton || emailErrorMessage }
						queryArgs={ this.props.queryArgs }
						userEmail={ this.getEmailValue() }
						labelText={ this.props.labelText }
						onInputBlur={ this.handleBlur }
						onInputChange={ this.handleChangeEvent }
						onCreateAccountError={ this.handleCreateAccountError }
						onCreateAccountSuccess={ this.props.handleCreateAccountSuccess }
						{ ...formProps }
					>
						{ emailErrorMessage && (
							<ValidationFieldset errorMessages={ [ emailErrorMessage ] }></ValidationFieldset>
						) }
					</PasswordlessSignupForm>

					{ ! isGravatar && (
						<>
							{ showSeparator && <FormDivider /> }
							{ this.props.isSocialSignupEnabled && (
								<SocialSignupForm
									handleResponse={ this.props.handleSocialResponse }
									socialServiceResponse={ this.props.socialServiceResponse }
									redirectToAfterLoginUrl={ this.props.redirectToAfterLoginUrl }
									compact={ this.props.isWoo }
								/>
							) }
							{ this.props.footerLink || this.footerLink() }
						</>
					) }
				</div>
			);
		}

		return (
			<div
				className={ clsx( 'signup-form', this.props.className, {
					'is-horizontal': this.isHorizontal(),
				} ) }
			>
				<LoggedOutForm onSubmit={ this.handleSubmit } noValidate>
					{ this.getNotice() }

					{ this.props.formHeader && (
						<header className="signup-form__header">{ this.props.formHeader }</header>
					) }

					{ this.formFields() }

					{ this.props.formFooter || this.formFooter() }
				</LoggedOutForm>

				{ showSeparator && <FormDivider /> }

				{ this.props.isSocialSignupEnabled && (
					<SocialSignupForm
						handleResponse={ this.props.handleSocialResponse }
						socialServiceResponse={ this.props.socialServiceResponse }
						flowName={ this.props.flowName }
						compact={ this.props.isWoo }
						redirectToAfterLoginUrl={ this.props.redirectToAfterLoginUrl }
					/>
				) }

				{ this.props.footerLink || this.footerLink() }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const oauth2Client = getCurrentOAuth2Client( state );
		const isWooJPC = isWooJPCFlow( state );

		return {
			currentUser: getCurrentUser( state ),
			oauth2Client,
			sectionName: getSectionName( state ),
			isJetpackWooDnaFlow: wooDnaConfig( getCurrentQueryArguments( state ) ).isWooDnaFlow(),
			from: get( getCurrentQueryArguments( state ), 'from' ),
			wccomFrom: getWccomFrom( state ),
			isWoo: getIsWoo( state ),
			isWooJPC,
			isGravatar: isGravatarOAuth2Client( oauth2Client ),
			isBlazePro: getIsBlazePro( state ),
		};
	},
	{
		trackLoginMidFlow: () => recordTracksEventWithClientId( 'calypso_signup_login_midflow' ),
		createSocialUserFailed,
		redirectToLogout,
		resetSignup,
	}
)( localize( SignupForm ) );
