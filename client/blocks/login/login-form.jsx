import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Card, FormInputValidation, FormLabel, Gridicon } from '@automattic/components';
import { alert } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { suggestEmailCorrection } from '@automattic/onboarding';
import { Spinner } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { capitalize, defer, includes, get, debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { FormDivider } from 'calypso/blocks/authentication';
import JetpackConnectSiteOnly from 'calypso/blocks/jetpack-connect-site-only';
import FormsButton from 'calypso/components/forms/form-button';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import TextControl from 'calypso/components/text-control';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import {
	getSignupUrl,
	pathWithLeadingSlash,
	isReactLostPasswordScreenEnabled,
	canDoMagicLogin,
	getLoginLinkPageUrl,
} from 'calypso/lib/login';
import {
	isCrowdsignalOAuth2Client,
	isWooOAuth2Client,
	isGravatarOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login, lostPassword } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	formUpdate,
	getAuthAccountType,
	loginUser,
	resetAuthAccountType,
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
import {
	isPartnerSignupQuery,
	isPasswordlessAccount,
	isRegularAccount,
} from 'calypso/state/login/utils';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWooPasswordless from 'calypso/state/selectors/get-is-woo-passwordless';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import ErrorNotice from './error-notice';
import SocialLoginForm from './social';
import { isA4AReferralClient } from './utils/is-a4a-referral-for-client';
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
		isLoggedIn: PropTypes.bool.isRequired,
		loginUser: PropTypes.func.isRequired,
		handleUsernameChange: PropTypes.func,
		oauth2Client: PropTypes.object,
		onSuccess: PropTypes.func.isRequired,
		privateSite: PropTypes.bool,
		redirectTo: PropTypes.string,
		requestError: PropTypes.object,
		resetAuthAccountType: PropTypes.func.isRequired,
		socialAccountIsLinking: PropTypes.bool,
		socialAccountLinkEmail: PropTypes.string,
		socialAccountLinkService: PropTypes.string,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		translate: PropTypes.func.isRequired,
		userEmail: PropTypes.string,
		isPartnerSignup: PropTypes.bool,
		locale: PropTypes.string,
		showSocialLoginFormOnly: PropTypes.bool,
		currentQuery: PropTypes.object,
		hideSignupLink: PropTypes.bool,
		isSignupExistingAccount: PropTypes.bool,
		sendMagicLoginLink: PropTypes.func,
		isSendingEmail: PropTypes.bool,
		cancelSocialAccountConnectLinking: PropTypes.func,
		isJetpack: PropTypes.bool,
	};

	state = {
		isFormDisabledWhileLoading: true,
		usernameOrEmail: this.props.socialAccountLinkEmail || this.props.userEmail || '',
		emailSuggestion: '',
		emailSuggestionError: false,
		password: '',
	};

	componentDidMount() {
		const { disableAutoFocus } = this.props;

		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( { isFormDisabledWhileLoading: false }, () => {
			! disableAutoFocus && this.usernameOrEmail && this.usernameOrEmail.focus();
		} );
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
			config.isEnabled( 'jetpack/magic-link-signup' ) &&
			requestError.code === 'unknown_user'
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

		return (
			socialAccountIsLinking ||
			( hasAccountTypeLoaded && isRegularAccount( accountType ) ) ||
			( this.props.isWoo && ! this.props.isPartnerSignup && ! this.props.isWooPasswordless ) ||
			this.props.isBlazePro
		);
	}

	isPasswordView() {
		const { accountType, hasAccountTypeLoaded, socialAccountIsLinking } = this.props;

		return (
			! socialAccountIsLinking &&
			hasAccountTypeLoaded &&
			isRegularAccount( accountType ) &&
			! ( this.props.isWoo && ! this.props.isPartnerSignup )
		);
	}

	isUsernameOrEmailView() {
		const { hasAccountTypeLoaded, socialAccountIsLinking, isSendingEmail } = this.props;
		return (
			isSendingEmail ||
			( ! socialAccountIsLinking &&
				! hasAccountTypeLoaded &&
				! ( this.props.isWoo && ! this.props.isPartnerSignup && ! this.props.isWooPasswordless ) &&
				! this.props.isBlazePro )
		);
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

		const isWooAndNotPartnerSignup =
			this.props.isWoo && ! this.props.isPartnerSignup && ! this.props.isWooPasswordless;

		// Skip this step if we're in the ( ( Woo and not the partner ) or Blaze Pro ) signup flows, and hasAccountTypeLoaded.
		if (
			! isWooAndNotPartnerSignup &&
			! this.props.hasAccountTypeLoaded &&
			! this.props.isBlazePro
		) {
			// Google Chrome on iOS will autofill without sending events, leading the user
			// to see a filled box but getting an error. We fetch the value directly from
			// the DOM as a workaround.
			const usernameOrEmail = ReactDom.findDOMNode( this.usernameOrEmail ).value;

			this.props.getAuthAccountType( usernameOrEmail );

			this.setState( {
				usernameOrEmail,
			} );

			return;
		}

		if ( isPasswordlessAccount( this.props.accountType ) ) {
			this.props.sendMagicLoginLink?.();
		}

		this.loginUser();
	};

	shouldUseRedirectLoginFlow() {
		const { currentRoute, oauth2Client } = this.props;
		// If calypso is loaded in a popup, we don't want to open a second popup for social login
		// let's use the redirect flow instead in that case
		let isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;

		// Jetpack Connect-in-place auth flow contains special reserved args, so we want a popup for social login.
		// See p1HpG7-7nj-p2 for more information.
		if ( isPopup && '/log-in/jetpack' === currentRoute ) {
			isPopup = false;
		}

		// disable for oauth2 flows for now
		return ! oauth2Client && isPopup;
	}

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

	renderPrivateSiteNotice() {
		if ( this.props.privateSite && ! this.props.isLoggedIn ) {
			return (
				<Notice status="is-info" showDismiss={ false } icon="lock">
					{ this.props.translate(
						'Log in to WordPress.com to proceed. ' +
							"If you are not a member of this site, we'll send " +
							'your username to the site owner for approval.'
					) }
				</Notice>
			);
		}
	}

	renderLoginFromSignupNotice() {
		return (
			<Notice status="is-transparent-info" showDismiss={ false }>
				{ this.props.translate(
					'This email address is already associated with an account. Please consider {{returnToSignup}}using another one{{/returnToSignup}} or log in.',
					{
						components: {
							returnToSignup: (
								<a href={ this.getSignupUrl() } onClick={ this.recordSignUpLinkClick } />
							),
						},
					}
				) }
			</Notice>
		);
	}

	onWooCommerceSocialSuccess = ( ...args ) => {
		this.recordWooCommerceLoginTracks( 'social' );
		this.props.onSuccess( args );
	};

	recordWooCommerceLoginTracks( method ) {
		const { isJetpackWooCommerceFlow, isWoo, wccomFrom } = this.props;
		if ( isJetpackWooCommerceFlow ) {
			this.props.recordTracksEvent( 'wcadmin_storeprofiler_login_jetpack_account', {
				login_method: method,
			} );
		} else if ( isWoo && 'cart' === wccomFrom ) {
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
		const { translate, isWoo, isWooCoreProfilerFlow, isWooPasswordless } = this.props;

		if ( this.isUsernameOrEmailView() || isWooPasswordless ) {
			return translate( 'Continue' );
		}

		if ( isWoo && ! isWooCoreProfilerFlow ) {
			return translate( 'Get started' );
		}

		return translate( 'Log In' );
	};

	showJetpackConnectSiteOnly = () => {
		const { currentQuery } = this.props;
		const isFromMigrationPlugin = currentQuery?.redirect_to?.includes( 'wpcom-migration' );
		return (
			( currentQuery?.skip_user || currentQuery?.allow_site_connection ) &&
			! isFromMigrationPlugin &&
			! this.props.isFromAutomatticForAgenciesPlugin
		);
	};

	renderWooCommerce( { showSocialLogin = true, socialToS } = {} ) {
		const isFormDisabled = this.state.isFormDisabledWhileLoading || this.props.isFormDisabled;
		const { requestError, socialAccountIsLinking: linkingSocialUser } = this.props;

		return (
			<form method="post">
				<Card className="login__form">
					{ this.renderPrivateSiteNotice() }
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
									linkingSocialService={
										this.props.socialAccountIsLinking ? this.props.socialAccountLinkService : null
									}
									onSuccess={ this.onWooCommerceSocialSuccess }
									socialService={ this.props.socialService }
									socialServiceResponse={ this.props.socialServiceResponse }
									uxMode={ this.shouldUseRedirectLoginFlow() ? 'redirect' : 'popup' }
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
		if ( this.props.isWooPasswordless ) {
			return this.props.translate( 'Your email or username' );
		}

		if ( this.props.isWooCoreProfilerFlow || this.props.isBlazePro ) {
			return this.props.translate( 'Your email address' );
		}

		if ( this.props.isP2Login || ( this.props.isWoo && ! this.props.isPartnerSignup ) ) {
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
				<span aria-hidden="true">{ this.props.translate( 'Email Address or Username' ) }</span>
			</>
		);
	}

	renderLostPasswordLink() {
		if ( isReactLostPasswordScreenEnabled() ) {
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
								action: this.props.isWooCoreProfilerFlow ? 'jetpack/lostpassword' : 'lostpassword',
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

		return (
			<a
				className="login__form-forgot-password"
				href={ lostPassword( this.props.locale ) }
				onClick={ () => this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' ) }
				rel="external"
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

		return this.props.signupUrl
			? window.location.origin + pathWithLeadingSlash( this.props.signupUrl )
			: getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname );
	}

	handleMagicLoginClick = ( origin ) => {
		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click', {
			origin,
		} );
		this.props.resetMagicLoginRequestForm();
	};

	getMagicLoginPageLink() {
		if (
			! canDoMagicLogin(
				this.props.twoFactorAuthType,
				this.props.oauth2Client,
				this.props.isJetpackWooCommerceFlow
			)
		) {
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
		if (
			! canDoMagicLogin(
				this.props.twoFactorAuthType,
				this.props.oauth2Client,
				this.props.isJetpackWooCommerceFlow
			)
		) {
			return null;
		}

		return getLoginLinkPageUrl( {
			locale: this.props.locale,
			twoFactorAuthType: 'qr',
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
			'It seems you entered an incorrect password. Want to get a {{magicLoginLink}}login link{{/magicLoginLink}} via email?',
			{
				components: {
					magicLoginLink: (
						<a
							href={ magicLoginPageLinkWithEmail }
							onClick={ () => this.handleMagicLoginClick( 'login-form' ) }
						/>
					),
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

	render() {
		const {
			accountType,
			oauth2Client,
			requestError,
			socialAccountIsLinking: linkingSocialUser,
			isJetpackWooCommerceFlow,
			isP2Login,
			isJetpack,
			isJetpackWooDnaFlow,
			currentQuery,
			showSocialLoginFormOnly,
			isWoo,
			isWooPasswordless,
			isPartnerSignup,
			isWooCoreProfilerFlow,
			isBlazePro,
			hideSignupLink,
			isSignupExistingAccount,
			isSendingEmail,
			isSocialFirst,
		} = this.props;

		const isFormDisabled = this.state.isFormDisabledWhileLoading || this.props.isFormDisabled;
		const isFormFilled =
			this.state.usernameOrEmail.trim().length === 0 || this.state.password.trim().length === 0;
		const isSubmitButtonDisabled =
			isWoo && ! isPartnerSignup && ! isWooPasswordless ? isFormFilled : isFormDisabled;
		const isOauthLogin = !! oauth2Client;
		const isPasswordHidden = this.isUsernameOrEmailView();
		const isCoreProfilerLostPasswordFlow = isWooCoreProfilerFlow && currentQuery.lostpassword_flow;
		const isFromAutomatticForAgenciesReferralClient = isA4AReferralClient(
			currentQuery,
			oauth2Client
		);
		const isFromGravatar3rdPartyApp =
			isGravatarOAuth2Client( oauth2Client ) && currentQuery?.gravatar_from === '3rd-party';

		const signupUrl = this.getSignupUrl();

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
						linkingSocialService={
							this.props.socialAccountIsLinking ? this.props.socialAccountLinkService : null
						}
						onSuccess={ this.props.onSuccess }
						socialService={ this.props.socialService }
						socialServiceResponse={ this.props.socialServiceResponse }
						uxMode={ this.shouldUseRedirectLoginFlow() ? 'redirect' : 'popup' }
						shouldRenderToS
					/>
				</Fragment>
			) : null;
		}

		if ( isJetpackWooCommerceFlow ) {
			return this.renderWooCommerce( { socialToS } );
		}

		if ( isJetpackWooDnaFlow ) {
			return this.renderWooCommerce( {
				showSocialLogin: !! accountType, // Only show the social buttons after the user entered an email.
				socialToS,
			} );
		}

		const shouldShowSocialLoginForm =
			config.isEnabled( 'signup/social' ) &&
			! isFromAutomatticForAgenciesReferralClient &&
			! isCoreProfilerLostPasswordFlow &&
			! isFromGravatar3rdPartyApp;

		return (
			<form
				className={ clsx( {
					'is-social-first': isSocialFirst,
					'is-woo-passwordless': isWooPasswordless,
					'is-blaze-pro': isBlazePro,
				} ) }
				onSubmit={ this.onSubmitForm }
				method="post"
			>
				{ isCrowdsignalOAuth2Client( oauth2Client ) && (
					<p className="login__form-subheader">
						{ this.props.translate( 'Connect with your WordPress.com account:' ) }
					</p>
				) }

				{ this.renderPrivateSiteNotice() }

				<Card className="login__form">
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

						{ isSignupExistingAccount && this.renderLoginFromSignupNotice() }

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
							disabled={ isFormDisabled || this.isPasswordView() || isFromGravatar3rdPartyApp }
						/>

						{ isJetpack && (
							<p className="login__form-account-tip">
								{ this.props.translate(
									'If you don’t have an account, we’ll use this email to create it.'
								) }
							</p>
						) }

						{ requestError && requestError.field === 'usernameOrEmail' && (
							<FormInputValidation isError text={ requestError.message }>
								{ 'unknown_user' === requestError.code &&
									this.props.translate(
										' Would you like to {{newAccountLink}}create a new account{{/newAccountLink}}?',
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

						{ isP2Login && this.isPasswordView() && this.renderChangeUsername() }

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
							<FormLabel htmlFor="password">
								{ this.props.isWoo && ! this.props.isPartnerSignup && ! this.props.isWooPasswordless
									? this.props.translate( 'Your password' )
									: this.props.translate( 'Password' ) }
							</FormLabel>

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

					{ ! isBlazePro && <p className="login__form-terms">{ socialToS }</p> }
					{ isWoo && ! isPartnerSignup && ! isWooPasswordless && this.renderLostPasswordLink() }
					<div className="login__form-action">
						<FormsButton
							primary
							busy={ ! isWoo && isSendingEmail }
							disabled={ isSubmitButtonDisabled }
						>
							{ isWoo && isSendingEmail ? <Spinner /> : this.getLoginButtonText() }
						</FormsButton>
					</div>

					{ ! hideSignupLink && isOauthLogin && (
						<div className={ clsx( 'login__form-signup-link' ) }>
							{ this.props.translate(
								'Not on WordPress.com? {{signupLink}}Create an Account{{/signupLink}}.',
								{
									components: {
										signupLink: <a href={ signupUrl } />,
									},
								}
							) }
						</div>
					) }
				</Card>

				{ shouldShowSocialLoginForm && (
					<Fragment>
						<FormDivider />
						<SocialLoginForm
							linkingSocialService={
								this.props.socialAccountIsLinking ? this.props.socialAccountLinkService : null
							}
							onSuccess={ this.props.onSuccess }
							socialService={ this.props.socialService }
							socialServiceResponse={ this.props.socialServiceResponse }
							uxMode={ this.shouldUseRedirectLoginFlow() ? 'redirect' : 'popup' }
							shouldRenderToS={
								this.props.isWoo && ! isPartnerSignup && ! this.props.isWooPasswordless
							}
							isWoo={ isWoo && isWooPasswordless }
							isSocialFirst={ isSocialFirst }
							magicLoginLink={ this.getMagicLoginPageLink() }
							qrLoginLink={ this.getQrLoginLink() }
						/>
					</Fragment>
				) }

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
			isLoggedIn: Boolean( getCurrentUserId( state ) ),
			oauth2Client: getCurrentOAuth2Client( state ),
			isFromAutomatticForAgenciesPlugin:
				'automattic-for-agencies-client' === get( getCurrentQueryArguments( state ), 'from' ),
			isJetpackWooCommerceFlow:
				'woocommerce-onboarding' === get( getCurrentQueryArguments( state ), 'from' ),
			isWooCoreProfilerFlow: isWooCommerceCoreProfilerFlow( state ),
			isJetpackWooDnaFlow: wooDnaConfig( getCurrentQueryArguments( state ) ).isWooDnaFlow(),
			isWoo:
				isWooOAuth2Client( getCurrentOAuth2Client( state ) ) ||
				isWooCommerceCoreProfilerFlow( state ),
			isPartnerSignup: isPartnerSignupQuery( getCurrentQueryArguments( state ) ),
			redirectTo: getRedirectToOriginal( state ),
			requestError: getRequestError( state ),
			socialAccountIsLinking: getSocialAccountIsLinking( state ),
			socialAccountLinkEmail: getSocialAccountLinkEmail( state ),
			socialAccountLinkService: getSocialAccountLinkService( state ),
			userEmail:
				props.userEmail ||
				getInitialQueryArguments( state )?.email_address ||
				getCurrentQueryArguments( state )?.email_address,
			wccomFrom: getWccomFrom( state ),
			currentQuery: getCurrentQueryArguments( state ),
			isWooPasswordless: getIsWooPasswordless( state ),
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
	}
)( localize( LoginForm ) );
