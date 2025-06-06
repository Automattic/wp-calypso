import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Card, FormInputValidation, FormLabel, Gridicon } from '@automattic/components';
import { alert } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { suggestEmailCorrection } from '@automattic/onboarding';
import { TextControl } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import cookie from 'cookie';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { capitalize, defer, includes, get, debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { FormDivider } from 'calypso/blocks/authentication';
import JetpackConnectSiteOnly from 'calypso/blocks/jetpack-connect-site-only';
import LoginSubmitButton from 'calypso/blocks/login/login-submit-button';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import { LastUsedSocialButton } from 'calypso/components/social-buttons';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import {
	getSignupUrl,
	pathWithLeadingSlash,
	canDoMagicLogin,
	getLoginLinkPageUrl,
} from 'calypso/lib/login';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import {
	formUpdate,
	getAuthAccountType,
	loginUser,
	resetAuthAccountType,
	loginSocialUser,
	createSocialUserFailed,
} from 'calypso/state/login/actions';
import { cancelSocialAccountConnectLinking } from 'calypso/state/login/actions/cancel-social-account-connect-linking';
import { resetMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import {
	getAuthAccountType as getAuthAccountTypeSelector,
	getRedirectToOriginal,
	getRequestError,
	getSocialAccountIsLinking,
	getSocialAccountLinkEmail,
	getSocialAccountLinkService,
	isFormDisabled as isFormDisabledSelector,
} from 'calypso/state/login/selectors';
import { isPasswordlessAccount, isRegularAccount } from 'calypso/state/login/utils';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWoo from 'calypso/state/selectors/get-is-woo';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import ErrorNotice from './error-notice';
import SocialLoginForm from './social';
import { isA4AReferralClient } from './utils/is-a4a-referral-for-client';
import { shouldUseMagicCode } from './utils/should-use-magic-code';

import './login-form.scss';

export class LoginForm extends Component {
	static propTypes = {
		accountType: PropTypes.string,
		disableAutoFocus: PropTypes.bool,
		sendEmailLogin: PropTypes.func.isRequired,
		formUpdate: PropTypes.func.isRequired,
		getAuthAccountType: PropTypes.func.isRequired,
		hasAccountTypeLoaded: PropTypes.bool.isRequired,
		isFormDisabled: PropTypes.bool,
		loginUser: PropTypes.func.isRequired,
		loginSocialUser: PropTypes.func.isRequired,
		createSocialUserFailed: PropTypes.func.isRequired,
		handleUsernameChange: PropTypes.func,
		oauth2Client: PropTypes.object,
		onSuccess: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		requestError: PropTypes.object,
		resetAuthAccountType: PropTypes.func.isRequired,
		socialAccountIsLinking: PropTypes.bool,
		socialAccountLinkEmail: PropTypes.string,
		socialAccountLinkService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		translate: PropTypes.func.isRequired,
		userEmail: PropTypes.string,
		locale: PropTypes.string,
		showSocialLoginFormOnly: PropTypes.bool,
		currentQuery: PropTypes.object,
		hideSignupLink: PropTypes.bool,
		sendMagicLoginLink: PropTypes.func,
		isSendingEmail: PropTypes.bool,
		cancelSocialAccountConnectLinking: PropTypes.func,
		isJetpack: PropTypes.bool,
		loginButtonText: PropTypes.string,
	};

	state = {
		isFormDisabledWhileLoading: true,
		usernameOrEmail: this.props.socialAccountLinkEmail || this.props.userEmail || '',
		emailSuggestion: '',
		emailSuggestionError: false,
		password: '',
		lastUsedAuthenticationMethod: this.getLastUsedAuthenticationMethod(),
	};

	componentDidMount() {
		const { disableAutoFocus } = this.props;

		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( { isFormDisabledWhileLoading: false }, () => {
			! disableAutoFocus && defer( () => this.usernameOrEmail && this.usernameOrEmail.focus() );
		} );
		// Remove url param to keep the last used login consistent upon refresh
		const url = new URL( window.location );
		if ( this.props.currentQuery?.username_only ) {
			url.searchParams.delete( 'username_only' );
			window.history.replaceState( {}, document.title, url );
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		const { currentRoute, disableAutoFocus, requestError, handleUsernameChange } = this.props;

		if ( handleUsernameChange && prevState.usernameOrEmail !== this.state.usernameOrEmail ) {
			handleUsernameChange( this.state.usernameOrEmail );
		}

		if ( prevProps.requestError || ! requestError ) {
			return;
		}

		if ( requestError.field === 'password' ) {
			! disableAutoFocus && defer( () => this.password && this.password.focus() );
		}

		if ( requestError.field === 'usernameOrEmail' ) {
			! disableAutoFocus && defer( () => this.usernameOrEmail && this.usernameOrEmail.focus() );
		}

		// User entered an email address or username that doesn't have a corresponding WPCOM account
		// and sign-up with magic links is enabled.
		if (
			currentRoute &&
			currentRoute.includes( '/log-in/jetpack' ) &&
			requestError.code === 'unknown_user' &&
			! this.props.isWooJPC
		) {
			this.jetpackCreateAccountWithMagicLink();
		}
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { disableAutoFocus } = this.props;

		if (
			this.props.socialAccountIsLinking !== nextProps.socialAccountIsLinking &&
			nextProps.socialAccountIsLinking
		) {
			this.setState( { usernameOrEmail: nextProps.socialAccountLinkEmail } );
			this.props.getAuthAccountType( nextProps.socialAccountLinkEmail );
		}

		if ( this.props.hasAccountTypeLoaded && ! nextProps.hasAccountTypeLoaded ) {
			this.setState( { password: '' } );

			! disableAutoFocus && defer( () => this.usernameOrEmail && this.usernameOrEmail.focus() );
		}

		if ( ! this.props.hasAccountTypeLoaded && isRegularAccount( nextProps.accountType ) ) {
			! disableAutoFocus && defer( () => this.password && this.password.focus() );
		}

		if ( nextProps.requestError ) {
			this.setState( {
				emailSuggestionError: false,
				emailSuggestion: '',
			} );
		}
	}

	debouncedEmailSuggestion = debounce( ( email ) => {
		if ( emailValidator.validate( email ) ) {
			const { newEmail, wasCorrected } = suggestEmailCorrection( email );
			if ( wasCorrected ) {
				this.props.recordTracksEvent( 'calypso_login_email_suggestion_generated', {
					original_email: JSON.stringify( email ),
					suggested_email: JSON.stringify( newEmail ),
				} );
				this.setState( {
					emailSuggestionError: true,
					emailSuggestion: newEmail,
				} );
				return;
			}
		}
	}, 500 );

	onChangeUsernameOrEmailField = ( event ) => {
		this.setState( {
			emailSuggestionError: false,
			emailSuggestion: '',
		} );
		this.onChangeField( event );
		this.debouncedEmailSuggestion( event.target.value );
	};

	onChangeField = ( event ) => {
		this.props.formUpdate();

		this.setState( {
			[ event.target.name ]: event.target.value,
		} );
	};

	isFullView() {
		const { accountType, hasAccountTypeLoaded, socialAccountIsLinking } = this.props;

		return socialAccountIsLinking || ( hasAccountTypeLoaded && isRegularAccount( accountType ) );
	}

	isPasswordView() {
		const { accountType, hasAccountTypeLoaded, socialAccountIsLinking } = this.props;

		return ! socialAccountIsLinking && hasAccountTypeLoaded && isRegularAccount( accountType );
	}

	isUsernameOrEmailView() {
		const { hasAccountTypeLoaded, socialAccountIsLinking, isSendingEmail } = this.props;
		return isSendingEmail || ( ! socialAccountIsLinking && ! hasAccountTypeLoaded );
	}

	resetView = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_block_login_form_change_username_or_email' );

		this.props.resetAuthAccountType();
	};

	loginUser() {
		const { password, usernameOrEmail } = this.state;
		const { onSuccess, redirectTo, domain } = this.props;

		this.props.recordTracksEvent( 'calypso_login_block_login_form_submit' );
		this.props
			.loginUser( usernameOrEmail, password, redirectTo, domain )
			.then( () => {
				this.props.recordTracksEvent( 'calypso_login_block_login_form_success' );
				onSuccess( redirectTo );
			} )
			.catch( ( error ) => {
				this.props.recordTracksEvent( 'calypso_login_block_login_form_failure', {
					error_code: error.code,
					error_message: error.message,
				} );
			} );
	}

	onSubmitForm = ( event ) => {
		event.preventDefault();

		if ( ! this.props.hasAccountTypeLoaded ) {
			// Google Chrome on iOS will autofill without sending events, leading the user
			// to see a filled box but getting an error. We fetch the value directly from
			// the DOM as a workaround.
			const usernameOrEmail = ReactDom.findDOMNode( this.usernameOrEmail ).value;

			this.props.getAuthAccountType( usernameOrEmail );

			this.setState( {
				usernameOrEmail,
			} );

			if ( this.props.isJetpack ) {
				const isEmailAddress = includes( usernameOrEmail, '@' );

				if ( isEmailAddress && isPasswordlessAccount( this.props.accountType ) ) {
					this.jetpackCreateAccountWithMagicLink();
					return;
				}
			}

			return;
		}

		if ( isPasswordlessAccount( this.props.accountType ) ) {
			this.props.sendMagicLoginLink?.();
		}

		this.loginUser();
	};

	savePasswordRef = ( input ) => {
		this.password = input;
	};

	saveUsernameOrEmailRef = ( input ) => {
		this.usernameOrEmail = input;
	};

	jetpackCreateAccountWithMagicLink() {
		// When a user enters a username or an email address that doesn't have a corresponding
		// WPCOM account, we need to figure out whether the user entered a username or an email
		// address. If the user entered an email address, we can safely attempt to create a WPCOM
		// account for this user with the help of magic links. On the other hand, if the user entered
		// a username, we need to prompt the user specifically for an email address to proceed with
		// the WPCOM account creation with magic links.

		const isEmailAddress = includes( this.state.usernameOrEmail, '@' );
		if ( isEmailAddress ) {
			// With Magic Links, create the user a WPCOM account linked to the entered email address
			this.props.sendEmailLogin( this.state.usernameOrEmail, {
				redirectTo: this.props.redirectTo,
				requestLoginEmailFormFlow: true,
				createAccount: true,
				...( shouldUseMagicCode( { isJetpack: this.props.isJetpack } ) && { tokenType: 'code' } ),
				flow: 'jetpack',
			} );
		}

		// Redirect user to the Magic Link form page
		page(
			addQueryArgs(
				{
					email_address: this.state.usernameOrEmail,
				},
				'/log-in/jetpack/link'
			)
		);
	}

	onWooCommerceSocialSuccess = ( ...args ) => {
		this.recordWooCommerceLoginTracks( 'social' );
		this.props.onSuccess( args );
	};

	recordWooCommerceLoginTracks( method ) {
		const { isWoo, wccomFrom } = this.props;
		if ( isWoo && 'cart' === wccomFrom ) {
			this.props.recordTracksEvent( 'wcadmin_storeprofiler_payment_login', {
				login_method: method,
			} );
		}
	}

	handleWooCommerceSubmit = ( event ) => {
		event.preventDefault();
		document.activeElement.blur();
		if ( ! this.props.hasAccountTypeLoaded ) {
			this.props.getAuthAccountType( this.state.usernameOrEmail );
			return;
		}
		this.recordWooCommerceLoginTracks( 'email' );
		this.loginUser();
	};

	getLoginButtonText = () => {
		const { translate, isWoo, isWooJPC, loginButtonText, isJetpack } = this.props;

		if ( loginButtonText ) {
			return loginButtonText;
		}

		if ( this.isUsernameOrEmailView() ) {
			if ( isJetpack ) {
				return translate( 'Continue with email' );
			}

			return translate( 'Continue' );
		}

		if ( isWoo && ! isWooJPC ) {
			return translate( 'Get started' );
		}

		return translate( 'Log In' );
	};

	showJetpackConnectSiteOnly = () => {
		// Currently we enforce users to create user connection in order to use Jetpack.
		return false;
	};

	renderWooCommerce( { showSocialLogin = true, socialToS } = {} ) {
		const isFormDisabled = this.state.isFormDisabledWhileLoading || this.props.isFormDisabled;
		const { requestError, socialAccountIsLinking: linkingSocialUser } = this.props;

		return (
			<form method="post">
				<Card className="login__form">
					<div className="login__form-userdata">
						{ linkingSocialUser && (
							<p>
								{ this.props.translate(
									'We found a WordPress.com account with the email address "%(email)s". ' +
										'Log in to this account to connect it to your %(service)s profile, ' +
										'or choose a different %(service)s profile.',
									{
										args: {
											email: this.props.socialAccountLinkEmail,
											service: capitalize( this.props.socialAccountLinkService ),
										},
									}
								) }
							</p>
						) }

						<FormLabel htmlFor="usernameOrEmail">
							{ this.isPasswordView() ? (
								<Button
									borderless
									className="login__form-change-username"
									onClick={ this.resetView }
								>
									<Gridicon icon="arrow-left" size={ 18 } />

									{ includes( this.state.usernameOrEmail, '@' )
										? this.props.translate( 'Change Email Address' )
										: this.props.translate( 'Change Username' ) }
								</Button>
							) : null }
						</FormLabel>

						<TextControl
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck="false"
							label={ this.props.translate( 'Email Address or Username' ) }
							disabled={ isFormDisabled || this.isPasswordView() }
							id="usernameOrEmail"
							name="usernameOrEmail"
							value={ this.state.usernameOrEmail }
							onChange={ ( value ) => {
								this.props.formUpdate();
								this.setState( {
									usernameOrEmail: value,
								} );
							} }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>

						{ requestError && requestError.field === 'usernameOrEmail' && (
							<FormInputValidation isError text={ requestError.message } />
						) }

						<div
							className={ clsx( 'login__form-password', {
								'is-hidden': this.isUsernameOrEmailView(),
							} ) }
						>
							<TextControl
								label={ this.props.translate( 'Password' ) }
								disabled={ isFormDisabled }
								id="password"
								name="password"
								type="password"
								value={ this.state.password }
								onChange={ ( value ) => {
									this.props.formUpdate();
									this.setState( {
										password: value,
									} );
								} }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>

							{ requestError && requestError.field === 'password' && (
								<FormInputValidation isError text={ requestError.message } />
							) }
						</div>
					</div>

					<div className="login__form-footer">
						<p className="login__social-tos">{ socialToS }</p>
						<div className="login__form-action">
							<Button
								primary
								disabled={ isFormDisabled }
								onClick={ this.handleWooCommerceSubmit }
								type="submit"
							>
								{ this.getLoginButtonText() }
							</Button>
						</div>

						{ config.isEnabled( 'signup/social' ) && showSocialLogin && (
							<div className="login__form-social">
								<div className="login__form-social-divider">
									<span>{ this.props.translate( 'or' ) }</span>
								</div>
								<SocialLoginForm
									handleLogin={ this.handleSocialLogin }
									trackLoginAndRememberRedirect={ this.trackLoginAndRememberRedirect }
									socialServiceResponse={ this.props.socialServiceResponse }
								/>
							</div>
						) }
					</div>
				</Card>
			</form>
		);
	}

	renderChangeUsername() {
		return (
			<button type="button" className="login__form-change-username" onClick={ this.resetView }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ includes( this.state.usernameOrEmail, '@' )
					? this.props.translate( 'Change Email Address' )
					: this.props.translate( 'Change Username' ) }
			</button>
		);
	}

	renderUsernameorEmailLabel() {
		if ( this.props.isWoo ) {
			return this.props.translate( 'Your email or username' );
		}

		if ( this.props.isWoo ) {
			return this.props.translate( 'Your email address or username' );
		}

		if ( this.props.currentQuery?.username_only === 'true' ) {
			return this.props.translate( 'Your username' );
		}

		return this.isPasswordView() ? (
			this.renderChangeUsername()
		) : (
			// Since the input receives focus on page load, screen reader users don't have any context
			// for what credentials to use. Unlike other users, they won't have seen the informative
			// text above the form. We therefore need to clarity the must use WordPress.com credentials.
			<>
				<span className="screen-reader-text">
					{ this.props.translate( 'WordPress.com Email Address or Username' ) }
				</span>
				{ ! this.props.isJetpack && (
					<span aria-hidden="true">{ this.props.translate( 'Email Address or Username' ) }</span>
				) }
			</>
		);
	}

	renderLostPasswordLink() {
		return (
			<a
				className="login__form-forgot-password"
				href="/"
				onClick={ ( event ) => {
					event.preventDefault();
					this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' );
					page(
						login( {
							redirectTo: this.props.redirectTo,
							locale: this.props.locale,
							action: this.props.isWooJPC ? 'jetpack/lostpassword' : 'lostpassword',
							oauth2ClientId: this.props.oauth2Client && this.props.oauth2Client.id,
							from: get( this.props.currentQuery, 'from' ),
						} )
					);
				} }
			>
				{ this.props.translate( 'Forgot password?' ) }
			</a>
		);
	}

	recordSignUpLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_sign_up_link_click', { origin: 'login-form' } );
	};

	getSignupUrl() {
		const { oauth2Client, currentQuery, currentRoute, pathname, locale } = this.props;

		if ( this.props.signupUrl ) {
			const sanitizedPath = this.props.signupUrl.replace( /\s/g, '' );
			return window.location.origin + pathWithLeadingSlash( sanitizedPath );
		}

		return getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname );
	}

	handleMagicLoginClick = ( origin ) => {
		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click', {
			origin,
		} );
		this.props.resetMagicLoginRequestForm();
	};

	getMagicLoginPageLink() {
		if ( ! canDoMagicLogin( this.props.twoFactorAuthType, this.props.oauth2Client ) ) {
			return null;
		}

		const { query, usernameOrEmail } = this.props;

		return getLoginLinkPageUrl( {
			locale: this.props.locale,
			currentRoute: this.props.currentRoute,
			signupUrl: this.props.currentQuery?.signup_url,
			oauth2ClientId: this.props.oauth2Client?.id,
			emailAddress: usernameOrEmail || query?.email_address || this.state.usernameOrEmail,
			redirectTo: this.props.redirectTo,
		} );
	}

	getQrLoginLink() {
		if ( ! canDoMagicLogin( this.props.twoFactorAuthType, this.props.oauth2Client ) ) {
			return null;
		}

		return getLoginLinkPageUrl( {
			locale: this.props.locale,
			twoFactorAuthType: this.props.isJetpack ? 'jetpack/qr' : 'qr',
			redirectTo: this.props.redirectTo,
			signupUrl: this.props.currentQuery?.signup_url,
		} );
	}

	renderMagicLoginLink() {
		const magicLoginPageLinkWithEmail = this.getMagicLoginPageLink();

		if ( ! magicLoginPageLinkWithEmail ) {
			return null;
		}

		return this.props.translate(
			'{{errorWrapper}}It seems you entered an incorrect password. Want to get a {{magicLoginLink}}login link{{/magicLoginLink}} via email?{{/errorWrapper}}',
			{
				components: {
					magicLoginLink: (
						<a
							href={ magicLoginPageLinkWithEmail }
							onClick={ () => this.handleMagicLoginClick( 'login-form' ) }
						/>
					),
					errorWrapper: <p className="login-form__validation-error-wrapper"></p>,
				},
			}
		);
	}

	renderPasswordValidationError() {
		return this.renderMagicLoginLink() ?? this.props.requestError.message;
	}

	handleAcceptEmailSuggestion() {
		this.props.recordTracksEvent( 'calypso_login_email_suggestion_confirmation', {
			original_email: JSON.stringify( this.state.usernameOrEmail ),
			suggested_email: JSON.stringify( this.state.emailSuggestion ),
		} );
		this.setState( {
			usernameOrEmail: this.state.emailSuggestion,
			emailSuggestion: '',
			emailSuggestionError: false,
		} );
	}

	handleSocialLogin = ( result ) => {
		let redirectTo = this.props.redirectTo;

		// load persisted redirect_to url from session storage, needed for redirect_to to work with google redirect flow
		if ( typeof window !== 'undefined' ) {
			if ( ! redirectTo ) {
				redirectTo = window.sessionStorage?.getItem( 'login_redirect_to' );
			}

			window.sessionStorage?.removeItem( 'login_redirect_to' );
		}

		this.props.loginSocialUser( result, redirectTo ).then(
			() => {
				this.recordSocialLoginEvent( 'calypso_login_social_login_success', result.service );
				this.props.onSuccess();
			},
			( error ) => {
				if ( error.code === 'user_exists' || error.code === 'unknown_user' ) {
					this.props.createSocialUserFailed( result, error, 'login' );
					return;
				}

				this.recordSocialLoginEvent( 'calypso_login_social_login_failure', result.service, {
					error_code: error.code,
					error_message: error.message,
				} );
			}
		);
	};

	trackLoginAndRememberRedirect = ( event, isLastUsedAuthenticationMethod = false ) => {
		const service = event.currentTarget.getAttribute( 'data-social-service' );

		this.recordSocialLoginEvent( 'calypso_login_social_button_click', service, {
			is_last_used_authentication_method: isLastUsedAuthenticationMethod,
		} );

		if ( this.props.redirectTo && typeof window !== 'undefined' ) {
			window.sessionStorage?.setItem( 'login_redirect_to', this.props.redirectTo );
		}
	};

	recordSocialLoginEvent = ( eventName, service, params ) =>
		this.props.recordTracksEvent( eventName, {
			social_account_type: service,
			...params,
		} );

	getLastUsedAuthenticationMethod() {
		if ( typeof document !== 'undefined' && this.props.currentQuery?.username_only !== 'true' ) {
			const cookies = cookie.parse( document.cookie );
			return cookies.last_used_authentication_method ?? '';
		}

		return '';
	}

	resetLastUsedAuthenticationMethod = () => {
		this.setState( { lastUsedAuthenticationMethod: 'password' } );
	};

	renderLoginCard() {
		const { lastUsedAuthenticationMethod } = this.state;
		const isFormDisabled = this.state.isFormDisabledWhileLoading || this.props.isFormDisabled;
		const isSubmitButtonDisabled = isFormDisabled;
		let loginUrl;

		const {
			oauth2Client,
			requestError,
			socialAccountIsLinking: linkingSocialUser,
			isWoo,
			isBlazePro,
			hideSignupLink,
			isSendingEmail,
			isSocialFirst,
			isJetpack,
		} = this.props;

		const isPasswordHidden = this.isUsernameOrEmailView();
		const isOauthLogin = !! oauth2Client;
		const signupUrl = this.getSignupUrl();
		const shouldRenderForgotPasswordLink = ! isPasswordHidden && isWoo;

		if ( lastUsedAuthenticationMethod === 'qr-code' ) {
			loginUrl = this.getQrLoginLink();
		} else if ( lastUsedAuthenticationMethod === 'magic-login' ) {
			loginUrl = this.getMagicLoginPageLink();
		}

		const showLastUsedAuthenticationMethod =
			lastUsedAuthenticationMethod &&
			lastUsedAuthenticationMethod !== 'password' &&
			lastUsedAuthenticationMethod !== 'magic-login' &&
			isSocialFirst;

		const signUpUrlWithEmail = addQueryArgs(
			{
				user_email: this.state.usernameOrEmail,
			},
			signupUrl
		);

		const renderTerms = () => {
			return this.props.translate(
				// To make any changes to this copy please speak to the legal team
				'By continuing with any of the options below, ' +
					'you agree to our {{tosLink}}Terms of Service{{/tosLink}} and' +
					' have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
				{
					components: {
						tosLink: (
							<a
								href={ localizeUrl( 'https://wordpress.com/tos/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						privacyLink: (
							<a
								href={ localizeUrl( 'https://automattic.com/privacy/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			);
		};

		return (
			<Card className="login__form">
				{ showLastUsedAuthenticationMethod ? (
					<>
						<span className="last-used-authentication-method">
							{ this.props.translate( 'Previously used' ) }
						</span>
						<LastUsedSocialButton
							lastUsedAuthenticationMethod={ this.state.lastUsedAuthenticationMethod }
							handleLogin={ this.handleSocialLogin }
							loginUrl={ loginUrl }
							onClick={ ( event ) => this.trackLoginAndRememberRedirect( event, true ) }
							socialServiceResponse={ this.props.socialServiceResponse }
						/>
					</>
				) : (
					<>
						{ isWoo && <ErrorNotice /> }
						<div className="login__form-userdata">
							{ ! isWoo && linkingSocialUser && (
								<p>
									{ this.props.translate(
										'We found a WordPress.com account with the email address "%(email)s". ' +
											'Log in to this account to connect it to your %(service)s profile, ' +
											'or choose a different %(service)s profile.',
										{
											args: {
												email: this.props.socialAccountLinkEmail,
												service: capitalize( this.props.socialAccountLinkService ),
											},
										}
									) }
								</p>
							) }

							<FormLabel htmlFor="usernameOrEmail">{ this.renderUsernameorEmailLabel() }</FormLabel>

							<FormTextInput
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck="false"
								autoComplete="username"
								className={ clsx( {
									'is-error': requestError && requestError.field === 'usernameOrEmail',
								} ) }
								onChange={ this.onChangeUsernameOrEmailField }
								id="usernameOrEmail"
								name="usernameOrEmail"
								ref={ this.saveUsernameOrEmailRef }
								value={ this.state.usernameOrEmail }
								disabled={ isFormDisabled || this.isPasswordView() }
							/>

							{ requestError && requestError.field === 'usernameOrEmail' && (
								<FormInputValidation isError text={ requestError.message }>
									{ requestError.code === 'unknown_user' &&
										this.props.translate(
											' Would you like to {{newAccountLink}}create a new account{{/newAccountLink}}?',
											{
												components: {
													newAccountLink: (
														<a
															onClick={ ( e ) => {
																e.preventDefault();
																window.location.href = signUpUrlWithEmail;
															} }
															href={ signUpUrlWithEmail }
														/>
													),
												},
											}
										) }
								</FormInputValidation>
							) }

							{ ! requestError && this.state.emailSuggestionError && (
								<FormInputValidation
									isError
									text={ this.props.translate(
										'User does not exist. Did you mean {{suggestedEmail/}}, or would you like to {{newAccountLink}}create a new account{{/newAccountLink}}?',
										{
											components: {
												newAccountLink: (
													<a
														href={ addQueryArgs(
															{
																user_email: this.state.usernameOrEmail,
															},
															signupUrl
														) }
													/>
												),
												suggestedEmail: (
													<span
														className="login__form-suggested-email"
														onKeyDown={ ( e ) => {
															if ( e.key === 'Enter' ) {
																this.handleAcceptEmailSuggestion();
															}
														} }
														onClick={ () => {
															this.handleAcceptEmailSuggestion();
														} }
														role="button"
														tabIndex="0"
													>
														{ this.state.emailSuggestion }
													</span>
												),
											},
										}
									) }
								/>
							) }

							{ isWoo && linkingSocialUser && (
								<Notice
									className="login__form-user-exists-notice"
									status="is-warning"
									icon={ <Icon icon={ alert } size={ 20 } fill="#d67709" /> }
									showDismiss
									onDismissClick={ this.props.cancelSocialAccountConnectLinking }
									text={ this.props.translate(
										'You already have a WordPress.com account with this email address. Add your password to log in or {{signupLink}}create a new account{{/signupLink}}.',
										{
											components: {
												signupLink: <a href={ signupUrl } />,
											},
										}
									) }
								/>
							) }

							<div
								className={ clsx( 'login__form-password', {
									'is-hidden': isPasswordHidden,
								} ) }
								aria-hidden={ isPasswordHidden }
							>
								<FormLabel htmlFor="password">{ this.props.translate( 'Password' ) }</FormLabel>

								<FormPasswordInput
									autoCapitalize="off"
									autoComplete="current-password"
									className={ clsx( {
										'is-error': requestError && requestError.field === 'password',
									} ) }
									onChange={ this.onChangeField }
									id="password"
									name="password"
									ref={ this.savePasswordRef }
									value={ this.state.password }
									disabled={ isFormDisabled }
									tabIndex={ isPasswordHidden ? -1 : undefined /* not tabbable when hidden */ }
								/>

								{ requestError && requestError.field === 'password' && (
									<FormInputValidation isError text={ this.renderPasswordValidationError() } />
								) }
							</div>
						</div>

						{ ! isBlazePro && ! isJetpack && (
							<p className="login__form-terms">{ renderTerms() }</p>
						) }

						{ shouldRenderForgotPasswordLink && this.renderLostPasswordLink() }

						<div className="login__form-action">
							<LoginSubmitButton
								isWoo={ isWoo }
								isSendingEmail={ isSendingEmail }
								isDisabled={ isSubmitButtonDisabled }
								buttonText={ this.getLoginButtonText() }
							/>
						</div>

						{ ! isBlazePro && isJetpack && (
							<p className="login__form-jetpack-terms">
								{ this.props.translate(
									'By continuing you agree to our {{tosLink}}Terms of Service{{/tosLink}} and ' +
										'to {{privacyLink}}sync your site’s data{{/privacyLink}} with us. We’ll check if that ' +
										'email is linked to an existing WordPress.com account or create a new one instantly. ',
									{
										components: {
											tosLink: (
												<a
													href={ localizeUrl( 'https://wordpress.com/tos/' ) }
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
											privacyLink: (
												<a
													href={ localizeUrl( 'https://automattic.com/privacy/' ) }
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										},
									}
								) }
							</p>
						) }

						{ ! hideSignupLink && isOauthLogin && (
							<p className={ clsx( 'login__form-signup-link' ) }>
								{ this.props.translate(
									'Not on WordPress.com? {{signupLink}}Create an Account{{/signupLink}}.',
									{
										components: {
											signupLink: <a href={ signupUrl } />,
										},
									}
								) }
							</p>
						) }
					</>
				) }
			</Card>
		);
	}

	renderLoginOptions() {
		const { oauth2Client, currentQuery, isWoo, isWooJPC, isSocialFirst, isJetpack } = this.props;

		const { lastUsedAuthenticationMethod } = this.state;

		const isCoreProfilerLostPasswordFlow = isWooJPC && currentQuery.lostpassword_flow;
		const isFromAutomatticForAgenciesReferralClient = isA4AReferralClient(
			currentQuery,
			oauth2Client
		);

		const showLastUsedAuthenticationMethod =
			lastUsedAuthenticationMethod &&
			lastUsedAuthenticationMethod !== 'password' &&
			lastUsedAuthenticationMethod !== 'magic-login' &&
			isSocialFirst;

		const shouldShowSocialLoginForm =
			config.isEnabled( 'signup/social' ) &&
			! isFromAutomatticForAgenciesReferralClient &&
			! isCoreProfilerLostPasswordFlow;

		if ( isJetpack ) {
			return (
				<div className="login__form-jetpack">
					{ shouldShowSocialLoginForm && (
						<SocialLoginForm
							lastUsedAuthenticationMethod={
								showLastUsedAuthenticationMethod ? this.state.lastUsedAuthenticationMethod : ''
							}
							handleLogin={ this.handleSocialLogin }
							trackLoginAndRememberRedirect={ this.trackLoginAndRememberRedirect }
							resetLastUsedAuthenticationMethod={ this.resetLastUsedAuthenticationMethod }
							socialServiceResponse={ this.props.socialServiceResponse }
							shouldRenderToS={ false }
							isWoo={ isWoo }
							isSocialFirst={
								isSocialFirst || ( isJetpack && ! this.props.isFromAutomatticForAgenciesPlugin )
							}
							magicLoginLink={ null }
							qrLoginLink={ this.getQrLoginLink() }
						/>
					) }

					<FormDivider />

					{ this.renderLoginCard() }
				</div>
			);
		}

		return (
			<>
				{ this.renderLoginCard() }

				{ shouldShowSocialLoginForm && (
					<Fragment>
						<FormDivider />
						<SocialLoginForm
							lastUsedAuthenticationMethod={
								showLastUsedAuthenticationMethod ? this.state.lastUsedAuthenticationMethod : ''
							}
							handleLogin={ this.handleSocialLogin }
							trackLoginAndRememberRedirect={ this.trackLoginAndRememberRedirect }
							resetLastUsedAuthenticationMethod={ this.resetLastUsedAuthenticationMethod }
							socialServiceResponse={ this.props.socialServiceResponse }
							shouldRenderToS={ false }
							isWoo={ isWoo }
							isSocialFirst={ isSocialFirst }
							magicLoginLink={ ! isWooJPC ? this.getMagicLoginPageLink() : null }
							qrLoginLink={ this.getQrLoginLink() }
						/>
					</Fragment>
				) }
			</>
		);
	}

	render() {
		const {
			accountType,
			isJetpackWooDnaFlow,
			currentQuery,
			showSocialLoginFormOnly,
			isWoo,
			isBlazePro,
			isSocialFirst,
		} = this.props;

		const socialToS = this.props.translate(
			// To make any changes to this copy please speak to the legal team
			'By continuing with any of the options below, ' +
				'you agree to our {{tosLink}}Terms of Service{{/tosLink}} and' +
				' have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
			{
				components: {
					tosLink: (
						<a
							href={ localizeUrl( 'https://wordpress.com/tos/' ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
					privacyLink: (
						<a
							href={ localizeUrl( 'https://automattic.com/privacy/' ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		);

		if ( showSocialLoginFormOnly ) {
			return config.isEnabled( 'signup/social' ) ? (
				<Fragment>
					<FormDivider />
					<SocialLoginForm
						handleLogin={ this.handleSocialLogin }
						trackLoginAndRememberRedirect={ this.trackLoginAndRememberRedirect }
						socialServiceResponse={ this.props.socialServiceResponse }
						shouldRenderToS
					/>
				</Fragment>
			) : null;
		}

		if ( isJetpackWooDnaFlow ) {
			return this.renderWooCommerce( {
				showSocialLogin: !! accountType, // Only show the social buttons after the user entered an email.
				socialToS,
			} );
		}

		return (
			<form
				className={ clsx( {
					'is-social-first': isSocialFirst,
					'is-woo-passwordless': isWoo,
					'is-blaze-pro': isBlazePro,
				} ) }
				onSubmit={ this.onSubmitForm }
				method="post"
			>
				{ this.renderLoginOptions() }

				{ this.showJetpackConnectSiteOnly() && (
					<JetpackConnectSiteOnly
						homeUrl={ currentQuery?.site }
						redirectAfterAuth={ currentQuery?.redirect_after_auth }
						source="login"
					/>
				) }
			</form>
		);
	}
}

export default connect(
	( state, props ) => {
		const accountType = getAuthAccountTypeSelector( state );

		return {
			accountType,
			currentRoute: getCurrentRoute( state ),
			hasAccountTypeLoaded: accountType !== null,
			isFormDisabled: isFormDisabledSelector( state ),
			oauth2Client: getCurrentOAuth2Client( state ),
			isFromAutomatticForAgenciesPlugin:
				'automattic-for-agencies-client' === get( getCurrentQueryArguments( state ), 'from' ),
			isJetpackWooDnaFlow: wooDnaConfig( getCurrentQueryArguments( state ) ).isWooDnaFlow(),
			isWooJPC: isWooJPCFlow( state ),
			isWoo: getIsWoo( state ),
			redirectTo: getRedirectToOriginal( state ),
			requestError: getRequestError( state ),
			socialAccountIsLinking: getSocialAccountIsLinking( state ),
			socialAccountLinkEmail: getSocialAccountLinkEmail( state ),
			socialAccountLinkService: getSocialAccountLinkService( state ),
			userEmail:
				props.userEmail ||
				getInitialQueryArguments( state )?.email_address ||
				getCurrentQueryArguments( state )?.email_address,
			socialService: getInitialQueryArguments( state )?.service,
			wccomFrom: getWccomFrom( state ),
			currentQuery: getCurrentQueryArguments( state ),
			isBlazePro: getIsBlazePro( state ),
		};
	},
	{
		sendEmailLogin,
		formUpdate,
		getAuthAccountType,
		loginUser,
		recordTracksEvent,
		resetAuthAccountType,
		resetMagicLoginRequestForm,
		cancelSocialAccountConnectLinking,
		createSocialUserFailed,
		loginSocialUser,
	}
)( localize( LoginForm ) );
