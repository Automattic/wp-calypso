import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon, FormLabel } from '@automattic/components';
import { addLocaleToPath, localizeUrl, getLanguage } from '@automattic/i18n-utils';
import clsx from 'clsx';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import AppPromo from 'calypso/blocks/app-promo';
import FormButton from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import GlobalNotices from 'calypso/components/global-notices';
import GravatarLoginLogo from 'calypso/components/gravatar-login-logo';
import JetpackHeader from 'calypso/components/jetpack-header';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import getGravatarOAuth2Flow from 'calypso/lib/get-gravatar-oauth2-flow';
import {
	isGravatarFlowOAuth2Client,
	isGravatarOAuth2Client,
	isWPJobManagerOAuth2Client,
	isGravPoweredOAuth2Client,
	isStudioAppOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import userAgent from 'calypso/lib/user-agent';
import wpcom from 'calypso/lib/wp';
import {
	recordTracksEventWithClientId as recordTracksEvent,
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { rebootAfterLogin } from 'calypso/state/login/actions';
import {
	hideMagicLoginRequestForm,
	fetchMagicLoginAuthenticate,
} from 'calypso/state/login/magic-login/actions';
import { CHECK_YOUR_EMAIL_PAGE } from 'calypso/state/login/magic-login/constants';
import {
	getLastCheckedUsernameOrEmail,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
	getRedirectToSanitized,
	getRedirectToOriginal,
} from 'calypso/state/login/selectors';
import {
	infoNotice,
	errorNotice,
	successNotice,
	removeNotice,
} from 'calypso/state/notices/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsWCCOM from 'calypso/state/selectors/get-is-wccom';
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import getMagicLoginRequestAuthError from 'calypso/state/selectors/get-magic-login-request-auth-error';
import getMagicLoginRequestedAuthSuccessfully from 'calypso/state/selectors/get-magic-login-requested-auth-successfully';
import isFetchingMagicLoginAuth from 'calypso/state/selectors/is-fetching-magic-login-auth';
import isFetchingMagicLoginEmail from 'calypso/state/selectors/is-fetching-magic-login-email';
import isMagicLoginEmailRequested from 'calypso/state/selectors/is-magic-login-email-requested';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import { withEnhancers } from 'calypso/state/utils';
import MainContentWooCoreProfiler from './main-content-woo-core-profiler';
import RequestLoginEmailForm from './request-login-email-form';
import './style.scss';

const RESEND_EMAIL_COUNTDOWN_TIME = 90; // In seconds
const GRAVATAR_FROM_3RD_PARTY = '3rd-party';
const GRAVATAR_FROM_QUICK_EDITOR = 'quick-editor';

class MagicLogin extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,

		// mapped to dispatch
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		recordPageView: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		sendEmailLogin: PropTypes.func.isRequired,
		fetchMagicLoginAuthenticate: PropTypes.func.isRequired,
		infoNotice: PropTypes.func.isRequired,
		errorNotice: PropTypes.func.isRequired,
		successNotice: PropTypes.func.isRequired,
		removeNotice: PropTypes.func.isRequired,
		rebootAfterLogin: PropTypes.func.isRequired,

		// mapped to state
		locale: PropTypes.string.isRequired,
		query: PropTypes.object,
		showCheckYourEmail: PropTypes.bool.isRequired,
		isSendingEmail: PropTypes.bool.isRequired,
		emailRequested: PropTypes.bool.isRequired,
		localeSuggestions: PropTypes.array,
		isValidatingCode: PropTypes.bool,
		isCodeValidated: PropTypes.bool,
		codeValidationError: PropTypes.object,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,
		redirectToSanitized: PropTypes.string,

		// From `localize`
		translate: PropTypes.func.isRequired,
		isWooJPC: PropTypes.bool,
	};

	state = {
		usernameOrEmail: this.props.userEmail || '',
		resendEmailCountdown: RESEND_EMAIL_COUNTDOWN_TIME,
		verificationCodeInputValue: '',
		isRequestingEmail: false,
		requestEmailErrorMessage: null,
		isSecondaryEmail: false,
		isNewAccount: false,
		publicToken: null,
		showSecondaryEmailOptions: false,
		showEmailCodeVerification: false,
		maskedEmailAddress: '',
		hashedEmail: null,
	};

	componentDidMount() {
		const { userEmail, oauth2Client, query } = this.props;

		this.props.recordPageView( '/log-in/link', 'Login > Link' );

		if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
			const isGravatarFlow = isGravatarFlowOAuth2Client( oauth2Client );

			this.props.recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_form', {
				client_id: oauth2Client.id,
				client_name: oauth2Client.title,
				from: query?.gravatar_from,
				is_gravatar_flow: isGravatarFlow,
				is_gravatar_flow_with_email: !! ( isGravatarFlow && query?.email_address ),
				is_initial_view: true,
			} );
		}

		// If the auto_trigger query parameter is set to true, automatically trigger the email send.
		if ( query?.auto_trigger !== undefined ) {
			if ( userEmail && emailValidator.validate( userEmail ) ) {
				if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
					this.handleGravPoweredEmailSubmit( userEmail );
				} else {
					this.props.sendEmailLogin( userEmail, {
						redirectTo: query?.redirect_to,
						requestLoginEmailFormFlow: true,
						createAccount: true,
						flow: 'jetpack', // Auto trigger is Jetpack flow
					} );
				}
			}
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		const {
			oauth2Client,
			emailRequested,
			localeSuggestions,
			path,
			showCheckYourEmail,
			isCodeValidated,
			twoFactorEnabled,
			twoFactorNotificationSent,
			redirectToSanitized,
			query,
		} = this.props;
		const { showSecondaryEmailOptions, showEmailCodeVerification } = this.state;

		if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
			if ( prevProps.isSendingEmail && emailRequested ) {
				this.startResendEmailCountdown();
			}

			if ( ! prevProps.localeSuggestions && localeSuggestions ) {
				const userLocale = localeSuggestions.find(
					( { locale } ) => locale === navigator.language.toLowerCase()
				);

				if ( userLocale ) {
					page( addLocaleToPath( path, userLocale.locale ) );
				}
			}

			const eventOptions = { client_id: oauth2Client.id, client_name: oauth2Client.title };

			if (
				( prevProps.showCheckYourEmail && ! showCheckYourEmail ) ||
				( prevState.showEmailCodeVerification && ! showEmailCodeVerification ) ||
				( prevState.showSecondaryEmailOptions && ! showSecondaryEmailOptions )
			) {
				const isGravatarFlow = isGravatarFlowOAuth2Client( oauth2Client );

				this.props.recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_form', {
					...eventOptions,
					from: query?.gravatar_from,
					is_gravatar_flow: isGravatarFlow,
					is_gravatar_flow_with_email: !! ( isGravatarFlow && query?.email_address ),
					is_initial_view: false,
				} );
			}

			if ( ! prevState.showSecondaryEmailOptions && showSecondaryEmailOptions ) {
				this.props.recordTracksEvent(
					'calypso_gravatar_powered_magic_login_secondary_email_options',
					eventOptions
				);

				this.props.recordTracksEvent(
					'calypso_gravatar_powered_magic_login_click_main_account',
					eventOptions
				);
			}

			if ( ! prevState.showEmailCodeVerification && showEmailCodeVerification ) {
				this.props.recordTracksEvent(
					'calypso_gravatar_powered_magic_login_email_code_verification',
					eventOptions
				);
			}

			if ( ! prevProps.showCheckYourEmail && showCheckYourEmail ) {
				this.props.recordTracksEvent(
					'calypso_gravatar_powered_magic_login_email_link_verification',
					eventOptions
				);
			}

			// Proceed to the next step if the magic code is validated.
			if ( ! prevProps.isCodeValidated && isCodeValidated ) {
				if ( ! twoFactorEnabled ) {
					this.props.rebootAfterLogin( { magic_login: 1 } );
				} else {
					page(
						login( {
							// If no notification is sent, the user is using the authenticator for 2FA by default.
							twoFactorAuthType: twoFactorNotificationSent.replace( 'none', 'authenticator' ),
							redirectTo: redirectToSanitized,
							oauth2ClientId: oauth2Client.id,
							locale: this.props.locale,
						} )
					);
				}
			}
		}
	}

	onClickEnterPasswordInstead = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_email_link_page_click_back' );

		const loginParameters = {
			isJetpack: this.props.isJetpackLogin,
			locale: this.props.locale,
			emailAddress: this.props.userEmail,
			signupUrl: this.props.query?.signup_url,
			usernameOnly: true,
		};

		page( login( loginParameters ) );
	};

	renderLinks() {
		const { isJetpackLogin, locale, showCheckYourEmail, translate, isWCCOM, query } = this.props;

		const isA4A = query?.redirect_to?.includes( 'agencies.automattic.com/client' ) ?? false;
		const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
		const isMobile = isiPad || isiPod || isiPhone || isAndroid;

		const hideAppPromo = isA4A || ! isMobile;

		if ( isWCCOM ) {
			return null;
		}

		if ( showCheckYourEmail ) {
			if ( hideAppPromo ) {
				return null;
			}
			return (
				<AppPromo
					title={ translate( 'Stay logged in with the Jetpack Mobile App' ) }
					campaign="calypso-login-link-check-email"
					className="magic-link-app-promo"
					iconSize={ 32 }
					hasQRCode
					hasGetAppButton={ false }
				/>
			);
		}
		if ( query?.client_id ) {
			return null;
		}

		// The email address from the URL (if present) is added to the login
		// parameters in this.onClickEnterPasswordInstead(). But it's left out
		// here deliberately, to ensure that if someone copies this link to
		// paste somewhere else, their email address isn't included in it.
		const loginParameters = {
			isJetpack: isJetpackLogin,
			locale: locale,
			signupUrl: this.props.query?.signup_url,
		};

		let linkBack = translate( 'Enter a password instead' );
		if ( query?.username_only === 'true' ) {
			linkBack = translate( 'Use username and password instead' );
		}

		return (
			<>
				<div className="magic-login__footer">
					<a href={ login( loginParameters ) } onClick={ this.onClickEnterPasswordInstead }>
						{ linkBack }
					</a>
				</div>
				{ ! hideAppPromo && (
					<AppPromo
						title={ translate( 'Stay logged in with the Jetpack Mobile App' ) }
						campaign="calypso-login-link"
						className="magic-link-app-promo"
						iconSize={ 32 }
						hasQRCode
						hasGetAppButton={ false }
					/>
				) }
			</>
		);
	}

	renderLocaleSuggestions() {
		const { locale, path, showCheckYourEmail } = this.props;

		if ( showCheckYourEmail ) {
			return null;
		}

		return <LocaleSuggestions locale={ locale } path={ path } />;
	}

	renderGutenboardingLogo() {
		if ( this.props.isWCCOM ) {
			return null;
		}

		return (
			<div className="magic-login__gutenboarding-wordpress-logo">
				<svg
					aria-hidden="true"
					role="img"
					focusable="false"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 20 20"
				>
					<path d="M20 10c0-5.51-4.49-10-10-10C4.48 0 0 4.49 0 10c0 5.52 4.48 10 10 10 5.51 0 10-4.48 10-10zM7.78 15.37L4.37 6.22c.55-.02 1.17-.08 1.17-.08.5-.06.44-1.13-.06-1.11 0 0-1.45.11-2.37.11-.18 0-.37 0-.58-.01C4.12 2.69 6.87 1.11 10 1.11c2.33 0 4.45.87 6.05 2.34-.68-.11-1.65.39-1.65 1.58 0 .74.45 1.36.9 2.1.35.61.55 1.36.55 2.46 0 1.49-1.4 5-1.4 5l-3.03-8.37c.54-.02.82-.17.82-.17.5-.05.44-1.25-.06-1.22 0 0-1.44.12-2.38.12-.87 0-2.33-.12-2.33-.12-.5-.03-.56 1.2-.06 1.22l.92.08 1.26 3.41zM17.41 10c.24-.64.74-1.87.43-4.25.7 1.29 1.05 2.71 1.05 4.25 0 3.29-1.73 6.24-4.4 7.78.97-2.59 1.94-5.2 2.92-7.78zM6.1 18.09C3.12 16.65 1.11 13.53 1.11 10c0-1.3.23-2.48.72-3.59C3.25 10.3 4.67 14.2 6.1 18.09zm4.03-6.63l2.58 6.98c-.86.29-1.76.45-2.71.45-.79 0-1.57-.11-2.29-.33.81-2.38 1.62-4.74 2.42-7.1z"></path>
				</svg>
			</div>
		);
	}

	handleGravPoweredEmailCodeSend = async ( email, cb = () => {} ) => {
		const { oauth2Client, query, locale, translate } = this.props;
		const { isSecondaryEmail, isNewAccount } = this.state;
		const noticeId = 'email-code-notice';
		const duration = 4000;
		const eventOptions = { client_id: oauth2Client.id, client_name: oauth2Client.title };

		this.setState( { isRequestingEmail: true } );

		try {
			this.props.infoNotice( translate( 'Sending email…' ), { id: noticeId, duration } );

			this.props.recordTracksEvent(
				'calypso_gravatar_powered_magic_login_email_code_requesting',
				eventOptions
			);

			const { public_token } = await wpcom.req.post(
				'/auth/send-login-email',
				{ apiVersion: '1.3' },
				{
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					locale,
					lang_id: getLanguage( locale ).value,
					email,
					redirect_to: query?.redirect_to,
					flow: getGravatarOAuth2Flow( oauth2Client ),
					create_account: true,
					tos: getToSAcceptancePayload(),
					token_type: 'code',
					...( isSecondaryEmail ? { gravatar_main: ! isNewAccount } : {} ),
				}
			);

			this.setState( { publicToken: public_token, showEmailCodeVerification: true } );
			this.startResendEmailCountdown();
			cb();

			this.props.removeNotice( noticeId );
			this.props.successNotice( translate( 'Email Sent. Check your mail app!' ), { duration } );

			this.props.recordTracksEvent(
				'calypso_gravatar_powered_magic_login_email_code_success',
				eventOptions
			);
		} catch ( error ) {
			if ( error.error ) {
				this.setState( { requestEmailErrorMessage: error.message } );
			} else {
				this.setState( {
					requestEmailErrorMessage: translate( 'Something went wrong. Please try again.' ),
				} );
			}

			this.props.removeNotice( noticeId );
			this.props.errorNotice( translate( 'Sorry, we couldn’t send the email.' ), { duration } );

			this.props.recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_code_failure', {
				...eventOptions,
				error_code: error.status,
				error_message: error.message,
			} );
		}

		this.setState( { isRequestingEmail: false } );
	};

	handleGravPoweredEmailSubmit = async ( usernameOrEmail, e ) => {
		e.preventDefault();

		const { translate, oauth2Client } = this.props;
		const eventOptions = { client_id: oauth2Client.id, client_name: oauth2Client.title };

		if ( ! emailValidator.validate( usernameOrEmail ) ) {
			return this.setState( { requestEmailErrorMessage: translate( 'Invalid email.' ) } );
		}

		this.setState( { usernameOrEmail, isRequestingEmail: true } );

		try {
			this.props.recordTracksEvent(
				'calypso_gravatar_powered_magic_login_gravatar_info_fetching',
				eventOptions
			);

			const { is_secondary, main_email_masked } = await wpcom.req.get( '/auth/get-gravatar-info', {
				email: usernameOrEmail,
			} );

			if ( is_secondary ) {
				this.setState( {
					usernameOrEmail,
					isSecondaryEmail: true,
					showSecondaryEmailOptions: true,
					maskedEmailAddress: main_email_masked,
					isRequestingEmail: false,
				} );
			} else {
				this.handleGravPoweredEmailCodeSend( usernameOrEmail );
			}

			this.props.recordTracksEvent(
				'calypso_gravatar_powered_magic_login_gravatar_info_success',
				eventOptions
			);
		} catch ( error ) {
			switch ( error.error ) {
				case 'not_found':
					this.setState( { isNewAccount: true } );
					this.handleGravPoweredEmailCodeSend( usernameOrEmail );
					break;
				case 'invalid_email':
					this.setState( {
						requestEmailErrorMessage: translate( 'Invalid email.' ),
						isRequestingEmail: false,
					} );
					break;
				default:
					this.setState( {
						requestEmailErrorMessage: translate( 'Something went wrong. Please try again.' ),
						isRequestingEmail: false,
					} );
			}

			this.props.recordTracksEvent( 'calypso_gravatar_powered_magic_login_gravatar_info_failure', {
				...eventOptions,
				error_code: error.status,
				error_message: error.message,
			} );
		}
	};

	handleGravPoweredCodeInputChange = ( e ) => {
		let value = e.target.value.toUpperCase();

		if ( ! /^[A-Z0-9]*$/.test( value ) || value.length > 6 ) {
			value = this.state.verificationCodeInputValue;
		}

		this.setState( { verificationCodeInputValue: value } );
	};

	handleGravPoweredCodeSubmit = ( e ) => {
		e.preventDefault();

		const { oauth2Client, query } = this.props;
		const { publicToken, verificationCodeInputValue } = this.state;

		this.props.fetchMagicLoginAuthenticate(
			`${ publicToken }:${ btoa( verificationCodeInputValue ) }`,
			query?.redirect_to,
			getGravatarOAuth2Flow( oauth2Client )
		);
	};

	handleGravPoweredEmailSwitch = () => {
		const { oauth2Client, hideMagicLoginRequestForm: showEmailForm } = this.props;

		this.setState( {
			showSecondaryEmailOptions: false,
			showEmailCodeVerification: false,
			verificationCodeInputValue: '',
			isNewAccount: false,
		} );
		showEmailForm();

		this.props.recordTracksEvent( 'calypso_gravatar_powered_magic_login_click_switch_email', {
			client_id: oauth2Client.id,
			client_name: oauth2Client.title,
		} );
	};

	renderGravPoweredMagicLoginTos() {
		const { oauth2Client, translate } = this.props;

		const textOptions = {
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
				wpAccountLink: (
					<a
						href={ localizeUrl( 'https://support.gravatar.com/why-wordpress-com/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		};

		return (
			<div className="grav-powered-magic-login__tos">
				{ isGravatarOAuth2Client( oauth2Client )
					? translate(
							`By clicking “Continue“, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, have read our {{privacyLink}}Privacy Policy{{/privacyLink}}, and understand that you're creating {{wpAccountLink}}a WordPress.com account{{/wpAccountLink}} if you don't already have one.`,
							textOptions
					  )
					: translate(
							`By clicking “Send me sign in link“, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, have read our {{privacyLink}}Privacy Policy{{/privacyLink}}, and understand that you're creating a Gravatar account if you don't already have one.`,
							textOptions
					  ) }
			</div>
		);
	}

	resendEmailCountdownId = null;

	resetResendEmailCountdown = () => {
		if ( ! this.resendEmailCountdownId ) {
			return;
		}

		clearInterval( this.resendEmailCountdownId );
		this.resendEmailCountdownId = null;
		this.setState( { resendEmailCountdown: RESEND_EMAIL_COUNTDOWN_TIME } );
	};

	startResendEmailCountdown = () => {
		this.resetResendEmailCountdown();

		this.resendEmailCountdownId = setInterval( () => {
			if ( ! this.state.resendEmailCountdown ) {
				clearInterval( this.resendEmailCountdownId );
				return;
			}

			this.setState( ( prevState ) => ( {
				resendEmailCountdown: prevState.resendEmailCountdown - 1,
			} ) );
		}, 1000 );
	};

	emailToSha256 = async ( email ) => {
		if ( ! window.crypto?.subtle ) {
			return null;
		}

		const data = new TextEncoder().encode( email );
		const hashBuffer = await crypto.subtle.digest( 'SHA-256', data );

		return Array.from( new Uint8Array( hashBuffer ) )
			.map( ( byte ) => byte.toString( 16 ).padStart( 2, '0' ) )
			.join( '' );
	};

	renderGravPoweredLogo() {
		const { oauth2Client } = this.props;

		return (
			<GravatarLoginLogo
				iconUrl={ oauth2Client.icon }
				alt={ oauth2Client.title }
				isCoBrand={ isGravatarFlowOAuth2Client( oauth2Client ) }
			/>
		);
	}

	renderGravPoweredSecondaryEmailOptions() {
		const { oauth2Client, translate, query } = this.props;
		const {
			usernameOrEmail,
			isNewAccount,
			maskedEmailAddress,
			isRequestingEmail,
			requestEmailErrorMessage,
			hashedEmail,
		} = this.state;
		const eventOptions = { client_id: oauth2Client.id, client_name: oauth2Client.title };
		const isFromGravatar3rdPartyApp =
			isGravatarOAuth2Client( oauth2Client ) && query?.gravatar_from === GRAVATAR_FROM_3RD_PARTY;
		const isFromGravatarQuickEditor =
			isGravatarOAuth2Client( oauth2Client ) && query?.gravatar_from === GRAVATAR_FROM_QUICK_EDITOR;
		const isGravatarFlowWithEmail = !! (
			isGravatarFlowOAuth2Client( oauth2Client ) && query?.email_address
		);
		const shouldShowSwitchEmail =
			! isFromGravatar3rdPartyApp && ! isFromGravatarQuickEditor && ! isGravatarFlowWithEmail;

		this.emailToSha256( usernameOrEmail ).then( ( email ) =>
			this.setState( { hashedEmail: email } )
		);

		return (
			<div className="grav-powered-magic-login__content">
				{ this.renderGravPoweredLogo() }
				<h1 className="grav-powered-magic-login__header">{ translate( 'Important note' ) }</h1>
				<p className="grav-powered-magic-login__sub-header">
					{ translate(
						'The submitted email is already linked to an existing Gravatar account as a secondary email:'
					) }
				</p>
				<div className="grav-powered-magic-login__account-info">
					<div className="grav-powered-magic-login__masked-email-address">
						{ translate( 'Account: {{strong}}%(maskedEmailAddress)s{{/strong}}', {
							components: { strong: <strong /> },
							args: { maskedEmailAddress },
						} ) }
					</div>
					{ hashedEmail && (
						<a href={ `https://gravatar.com/${ hashedEmail }` } target="_blank" rel="noreferrer">
							{ translate( 'Open profile' ) }
						</a>
					) }
				</div>
				<div className="grav-powered-magic-login__account-options">
					<button
						className={ clsx( 'grav-powered-magic-login__account-option', {
							'grav-powered-magic-login__account-option--selected': ! isNewAccount,
						} ) }
						onClick={ () => {
							this.setState( { isNewAccount: false } );

							this.props.recordTracksEvent(
								'calypso_gravatar_powered_magic_login_click_main_account',
								eventOptions
							);
						} }
						disabled={ isRequestingEmail }
					>
						{ translate( 'Log in with main account (recommended)' ) }
					</button>
					{ ! isNewAccount && (
						<div>
							{ translate(
								'Log in with your main account and edit there your avatar for your secondary email address.'
							) }
						</div>
					) }
					<button
						className={ clsx( 'grav-powered-magic-login__account-option', {
							'grav-powered-magic-login__account-option--selected': isNewAccount,
						} ) }
						onClick={ () => {
							this.setState( { isNewAccount: true } );

							this.props.recordTracksEvent(
								'calypso_gravatar_powered_magic_login_click_new_account',
								eventOptions
							);
						} }
						disabled={ isRequestingEmail }
					>
						{ translate( 'Create a new account' ) }
					</button>
					{ isNewAccount && (
						<div>
							{ translate(
								'If you continue a new account will be created, and {{strong}}%(emailAddress)s{{/strong}} will be disconnected from the current main account.',
								{
									components: { strong: <strong /> },
									args: { emailAddress: usernameOrEmail },
								}
							) }
						</div>
					) }
				</div>
				{ requestEmailErrorMessage && (
					<Notice
						duration={ 10000 }
						text={ requestEmailErrorMessage }
						className="magic-login__request-login-email-form-notice"
						showDismiss={ false }
						onDismissClick={ () => this.setState( { requestEmailErrorMessage: null } ) }
						status="is-transparent-info"
					/>
				) }
				<FormButton
					onClick={ () =>
						this.handleGravPoweredEmailCodeSend( usernameOrEmail, () =>
							this.setState( { showSecondaryEmailOptions: false } )
						)
					}
					disabled={ isRequestingEmail || !! requestEmailErrorMessage }
					busy={ isRequestingEmail }
				>
					{ translate( 'Continue' ) }
				</FormButton>
				<footer className="grav-powered-magic-login__footer">
					{ shouldShowSwitchEmail && (
						<button onClick={ this.handleGravPoweredEmailSwitch }>
							{ translate( 'Switch email' ) }
						</button>
					) }
					<a href="https://gravatar.com/support" target="_blank" rel="noreferrer">
						{ translate( 'Need help logging in?' ) }
					</a>
				</footer>
			</div>
		);
	}

	renderGravPoweredEmailCodeVerification() {
		const {
			oauth2Client,
			translate,
			isValidatingCode,
			isCodeValidated,
			codeValidationError,
			query,
		} = this.props;
		const {
			isSecondaryEmail,
			isNewAccount,
			isRequestingEmail,
			maskedEmailAddress,
			usernameOrEmail,
			verificationCodeInputValue,
			resendEmailCountdown,
		} = this.state;
		const isFromGravatar3rdPartyApp =
			isGravatarOAuth2Client( oauth2Client ) && query?.gravatar_from === GRAVATAR_FROM_3RD_PARTY;
		const isFromGravatarQuickEditor =
			isGravatarOAuth2Client( oauth2Client ) && query?.gravatar_from === GRAVATAR_FROM_QUICK_EDITOR;
		const isGravatarFlowWithEmail = !! (
			isGravatarFlowOAuth2Client( oauth2Client ) && query?.email_address
		);
		const shouldShowSwitchEmail =
			! isFromGravatar3rdPartyApp && ! isFromGravatarQuickEditor && ! isGravatarFlowWithEmail;
		const isProcessingCode = isValidatingCode || isCodeValidated;
		let errorText = translate( 'Something went wrong. Please try again.' );

		if ( codeValidationError?.type === 'sms_code_throttled' ) {
			errorText = translate(
				'Your two-factor code via SMS can only be requested once per minute. Please wait, then request a new code via email to proceed.'
			);
		} else if ( codeValidationError?.type === 'user_email' ) {
			errorText = translate(
				"We're sorry, you can't create a new account at this time. Please try a different email address or disable any VPN before trying again."
			);
		} else if ( codeValidationError?.code === 403 ) {
			errorText = translate(
				'Invalid code. If the error persists, please request a new code and try again.'
			);
		} else if ( codeValidationError?.code === 429 ) {
			errorText = translate( 'Please wait a minute before trying again.' );
		}

		return (
			<div className="grav-powered-magic-login__content">
				{ this.renderGravPoweredLogo() }
				<h1 className="grav-powered-magic-login__header">{ translate( 'Check your email' ) }</h1>
				<p className="grav-powered-magic-login__sub-header">
					<span>
						{ translate(
							'Enter the verification code we’ve sent to {{strong}}%(emailAddress)s{{/strong}}.',
							{
								components: { strong: <strong /> },
								args: {
									emailAddress:
										isSecondaryEmail && ! isNewAccount ? maskedEmailAddress : usernameOrEmail,
								},
							}
						) }
					</span>
					{ isSecondaryEmail && isNewAccount && (
						<span>{ translate( ' A new Gravatar account will be created.' ) }</span>
					) }
					{ isSecondaryEmail && ! isNewAccount && (
						<span>{ translate( ' This email already exists and is synced with Gravatar.' ) }</span>
					) }
				</p>
				{ isNewAccount && this.renderGravPoweredMagicLoginTos() }
				<form
					className="grav-powered-magic-login__verification-code-form"
					onSubmit={ this.handleGravPoweredCodeSubmit }
				>
					<FormLabel htmlFor="verification-code" hidden>
						{ translate( 'Enter the verification code' ) }
					</FormLabel>
					<FormTextInput
						id="verification-code"
						value={ verificationCodeInputValue }
						onChange={ this.handleGravPoweredCodeInputChange }
						placeholder={ translate( 'Verification code' ) }
						disabled={ isProcessingCode }
						isError={ !! codeValidationError }
						autoFocus // eslint-disable-line jsx-a11y/no-autofocus
					/>
					{ codeValidationError && (
						<Notice
							text={ errorText }
							className="magic-login__request-login-email-form-notice"
							showDismiss={ false }
							status="is-transparent-info"
						/>
					) }
					<FormButton
						primary
						disabled={
							! verificationCodeInputValue ||
							verificationCodeInputValue.length < 6 ||
							isProcessingCode
						}
						busy={ isProcessingCode }
					>
						{ translate( 'Continue' ) }
					</FormButton>
				</form>
				<footer
					className={ clsx( 'grav-powered-magic-login__footer', {
						'grav-powered-magic-login__footer--vertical': ! isFromGravatar3rdPartyApp,
					} ) }
				>
					<button
						onClick={ () => {
							this.handleGravPoweredEmailCodeSend( usernameOrEmail );

							this.props.recordTracksEvent(
								'calypso_gravatar_powered_magic_login_click_resend_email',
								{ type: 'code', client_id: oauth2Client.id, client_name: oauth2Client.title }
							);
						} }
						disabled={ isRequestingEmail || resendEmailCountdown }
					>
						{ resendEmailCountdown === 0
							? translate( 'Send again' )
							: translate( 'Send again (%(countdown)d)', {
									args: { countdown: resendEmailCountdown },
							  } ) }
					</button>
					{ shouldShowSwitchEmail && (
						<button
							onClick={ () => {
								this.resetResendEmailCountdown();
								this.handleGravPoweredEmailSwitch();
							} }
						>
							{ translate( 'Switch email' ) }
						</button>
					) }
					<a href="https://gravatar.com/support" target="_blank" rel="noreferrer">
						{ translate( 'Need help logging in?' ) }
					</a>
				</footer>
			</div>
		);
	}

	renderGravPoweredEmailLinkVerification() {
		const {
			oauth2Client,
			translate,
			query,
			isSendingEmail,
			sendEmailLogin: resendEmail,
		} = this.props;
		const { usernameOrEmail, resendEmailCountdown } = this.state;
		const emailAddress = usernameOrEmail.includes( '@' ) ? usernameOrEmail : null;

		const emailTextOptions = {
			components: {
				sendEmailButton: (
					<button
						onClick={ () => {
							resendEmail( usernameOrEmail, {
								redirectTo: query?.redirect_to,
								requestLoginEmailFormFlow: true,
								createAccount: true,
								flow: getGravatarOAuth2Flow( oauth2Client ),
								showGlobalNotices: true,
							} );

							this.props.recordTracksEvent(
								'calypso_gravatar_powered_magic_login_click_resend_email',
								{ type: 'link', client_id: oauth2Client.id, client_name: oauth2Client.title }
							);
						} }
						disabled={ isSendingEmail }
					/>
				),
				showMagicLoginButton: (
					<button
						className="grav-powered-magic-login__show-magic-login"
						onClick={ () => {
							this.resetResendEmailCountdown();
							this.handleGravPoweredEmailSwitch();
						} }
					/>
				),
			},
		};

		return (
			<div className="grav-powered-magic-login__content">
				{ this.renderGravPoweredLogo() }
				<h1 className="grav-powered-magic-login__header">{ translate( 'Check your email!' ) }</h1>
				<p className="grav-powered-magic-login__sub-header">
					{ emailAddress
						? translate(
								"We've sent an email with a verification link to {{strong}}%(emailAddress)s{{/strong}}",
								{
									components: { strong: <strong /> },
									args: { emailAddress },
								}
						  )
						: translate(
								'We just emailed you a link. Please check your inbox and click the link to log in.'
						  ) }
				</p>
				<hr className="grav-powered-magic-login__divider" />
				<div className="grav-powered-magic-login__footer">
					<div>{ translate( 'Are you having issues receiving it?' ) }</div>
					<div>
						{ resendEmailCountdown === 0
							? translate(
									'{{sendEmailButton}}Resend the verification email{{/sendEmailButton}} or {{showMagicLoginButton}}use a different email address{{/showMagicLoginButton}}.',
									emailTextOptions
							  )
							: translate(
									'{{showMagicLoginButton}}Use a different email address{{/showMagicLoginButton}}.',
									emailTextOptions
							  ) }
					</div>
				</div>
			</div>
		);
	}

	renderGravPoweredMagicLogin() {
		const { oauth2Client, translate, locale, query } = this.props;
		const { isRequestingEmail, requestEmailErrorMessage } = this.state;

		const isGravatarFlow = isGravatarFlowOAuth2Client( oauth2Client );
		const isGravatarFlowWithEmail = !! ( isGravatarFlow && query?.email_address );
		const isGravatar = isGravatarOAuth2Client( oauth2Client );
		const isWPJobManager = isWPJobManagerOAuth2Client( oauth2Client );
		const isFromGravatarSignup = isGravatar && query?.gravatar_from === 'signup';
		const isFromGravatar3rdPartyApp =
			isGravatar && query?.gravatar_from === GRAVATAR_FROM_3RD_PARTY;
		const isFromGravatarQuickEditor =
			isGravatar && query?.gravatar_from === GRAVATAR_FROM_QUICK_EDITOR;
		const isEmailInputDisabled =
			isFromGravatar3rdPartyApp ||
			isFromGravatarQuickEditor ||
			isRequestingEmail ||
			isGravatarFlowWithEmail;
		const submitButtonLabel = isGravatar
			? translate( 'Continue' )
			: translate( 'Send me sign in link' );
		const loginUrl = login( {
			locale,
			redirectTo: query?.redirect_to,
			oauth2ClientId: query?.client_id,
			gravatarFrom: query?.gravatar_from,
			gravatarFlow: isGravatarFlow,
			emailAddress: query?.email_address,
		} );
		let headerText = isFromGravatarSignup
			? translate( 'Create your Gravatar' )
			: translate( 'Edit your Gravatar' );
		headerText = isWPJobManager ? translate( 'Sign in with your email' ) : headerText;
		let subHeader = '';

		if ( isGravatarFlow ) {
			subHeader = translate( '%(clientTitle)s profiles are powered by Gravatar.', {
				args: { clientTitle: oauth2Client.title },
			} );
		} else if ( isFromGravatar3rdPartyApp || isFromGravatarQuickEditor ) {
			subHeader = translate( 'Profiles and avatars are powered by Gravatar.' );
		}

		return (
			<>
				{ this.renderLocaleSuggestions() }
				<GlobalNotices id="notices" />
				<div className="grav-powered-magic-login__content">
					{ this.renderGravPoweredLogo() }
					<RequestLoginEmailForm
						flow={ getGravatarOAuth2Flow( oauth2Client ) }
						headerText={ headerText }
						subHeaderText={ subHeader }
						hideSubHeaderText={ ! subHeader }
						inputPlaceholder={ translate( 'Enter your email address' ) }
						submitButtonLabel={ submitButtonLabel }
						tosComponent={ ! isGravatar && this.renderGravPoweredMagicLoginTos() }
						onSubmitEmail={ isGravatar ? this.handleGravPoweredEmailSubmit : undefined }
						onSendEmailLogin={ ( usernameOrEmail ) => this.setState( { usernameOrEmail } ) }
						createAccountForNewUser
						errorMessage={ requestEmailErrorMessage }
						onErrorDismiss={ () => this.setState( { requestEmailErrorMessage: null } ) }
						isEmailInputDisabled={ isEmailInputDisabled }
						isEmailInputError={ !! requestEmailErrorMessage }
						isSubmitButtonDisabled={ isRequestingEmail || !! requestEmailErrorMessage }
						isSubmitButtonBusy={ isRequestingEmail }
					/>
					{ isGravatar && (
						<div className="grav-powered-magic-login__feature-items">
							<div className="grav-powered-magic-login__feature-item">
								<svg
									className="grav-powered-magic-login__feature-icon"
									width="40"
									height="41"
									viewBox="0 0 40 41"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<circle
										cx="20"
										cy="20.5"
										r="19.25"
										fill="white"
										stroke="#1D4FC4"
										strokeWidth="1.5"
									/>
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M24 17.5C24 19.7091 22.2091 21.5 20 21.5C17.7909 21.5 16 19.7091 16 17.5C16 15.2909 17.7909 13.5 20 13.5C22.2091 13.5 24 15.2909 24 17.5ZM22.5 17.5C22.5 18.8807 21.3807 20 20 20C18.6193 20 17.5 18.8807 17.5 17.5C17.5 16.1193 18.6193 15 20 15C21.3807 15 22.5 16.1193 22.5 17.5Z"
										fill="#1D4FC4"
									/>
									<path
										d="M26.75 28.5V26.5C26.75 24.9812 25.5188 23.75 24 23.75L16 23.75C14.4812 23.75 13.25 24.9812 13.25 26.5V28.5H14.75L14.75 26.5C14.75 25.8096 15.3096 25.25 16 25.25L24 25.25C24.6904 25.25 25.25 25.8096 25.25 26.5V28.5H26.75Z"
										fill="#1D4FC4"
									/>
								</svg>
								<div>
									<h4 className="grav-powered-magic-login__feature-header">
										{ translate( 'One connected profile' ) }
									</h4>
									<p className="grav-powered-magic-login__feature-sub-header">
										{ translate( 'Your avatar and bio that syncs across the web.' ) }
									</p>
								</div>
							</div>
							<div className="grav-powered-magic-login__feature-item">
								<svg
									className="grav-powered-magic-login__feature-icon"
									width="40"
									height="41"
									viewBox="0 0 40 41"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<circle
										cx="20"
										cy="20.5"
										r="19.25"
										fill="white"
										stroke="#1D4FC4"
										strokeWidth="1.5"
									/>
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M20 11.75C17.9289 11.75 16.25 13.4289 16.25 15.5V18.5H15C14.4477 18.5 14 18.9477 14 19.5V27.5C14 28.0523 14.4477 28.5 15 28.5H25C25.5523 28.5 26 28.0523 26 27.5V19.5C26 18.9477 25.5523 18.5 25 18.5H23.75V15.5C23.75 13.4289 22.0711 11.75 20 11.75ZM22.25 18.5V15.5C22.25 14.2574 21.2426 13.25 20 13.25C18.7574 13.25 17.75 14.2574 17.75 15.5V18.5H22.25ZM15.5 27V20H24.5V27H15.5Z"
										fill="#1D4FC4"
									/>
								</svg>
								<div>
									<h4 className="grav-powered-magic-login__feature-header">
										{ translate( 'Public, open, and responsible' ) }
									</h4>
									<p className="grav-powered-magic-login__feature-sub-header">
										{ translate( 'Full control over your data and privacy.' ) }
									</p>
								</div>
							</div>
							<div className="grav-powered-magic-login__feature-item">
								<svg
									className="grav-powered-magic-login__feature-icon"
									width="40"
									height="41"
									viewBox="0 0 40 41"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<circle
										cx="20"
										cy="20.5"
										r="19.25"
										fill="white"
										stroke="#1D4FC4"
										strokeWidth="1.5"
									/>
									<path
										d="M19 21.5V26.5H20.5V21.5H25.5V20H20.5V15H19V20H14V21.5H19Z"
										fill="#1D4FC4"
									/>
								</svg>
								<div>
									<h4 className="grav-powered-magic-login__feature-header">
										{ translate( '200+ million users' ) }
									</h4>
									<p className="grav-powered-magic-login__feature-sub-header">
										{ translate( 'Used by WordPress, Slack, and many more.' ) }
									</p>
								</div>
							</div>
						</div>
					) }
					{ isWPJobManager && (
						<hr className="grav-powered-magic-login__divider grav-powered-magic-login__divider--email-form" />
					) }
					{ ! isFromGravatarSignup && (
						<footer className="grav-powered-magic-login__footer grav-powered-magic-login__footer--email-form">
							{ translate( '{{a}}Sign in another way{{/a}}', {
								components: {
									a: (
										<a
											href={ loginUrl }
											onClick={ () =>
												this.props.recordTracksEvent(
													'calypso_gravatar_powered_magic_login_click_login_page_link',
													{ client_id: oauth2Client.id, client_name: oauth2Client.title }
												)
											}
										/>
									),
								},
							} ) }
						</footer>
					) }
				</div>
				{ isWPJobManager && (
					<div className="grav-powered-magic-login__gravatar-info">
						<div className="grav-powered-magic-login__gravatar-info-heading">
							<img
								src="https://gravatar.com/images/grav-logo-blue.svg"
								width={ 18 }
								height={ 18 }
								alt="Gravatar logo"
							/>
							{ translate( 'You will be logging in via Gravatar' ) }
						</div>
						<div className="grav-powered-magic-login__gravatar-info-items">
							<div>
								<Gridicon icon="checkmark" size={ 18 } color="#646970" />
								{ translate(
									'Gravatar accounts and profiles are free. You can log in to thousands of sites across the web with one Gravatar account.'
								) }
							</div>
							<div>
								<Gridicon icon="checkmark" size={ 18 } color="#646970" />
								{ translate( 'Control what information is shared on your public profile.' ) }
							</div>
							<div>
								<Gridicon icon="checkmark" size={ 18 } color="#646970" />
								{ translate(
									"Have questions? Please see Gravatar's {{a}}documentation here{{/a}}.",
									{
										components: {
											a: <a href="https://gravatar.com/support" target="_blank" rel="noreferrer" />,
										},
									}
								) }
							</div>
						</div>
					</div>
				) }
			</>
		);
	}

	renderStudioLoginTos = () => {
		const options = {
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
		};
		const tosText = this.props.translate(
			'By creating an account you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
			options
		);

		return <p className="studio-magic-login__tos">{ tosText }</p>;
	};

	render() {
		const {
			oauth2Client,
			query,
			translate,
			showCheckYourEmail: showEmailLinkVerification,
			isWooJPC,
		} = this.props;
		const { showSecondaryEmailOptions, showEmailCodeVerification, usernameOrEmail } = this.state;

		if ( isWooJPC ) {
			return (
				<Main className="magic-login magic-login__request-link is-white-login">
					{ this.renderLocaleSuggestions() }
					<GlobalNotices id="notices" />
					<MainContentWooCoreProfiler
						emailAddress={ usernameOrEmail }
						redirectTo={ this.props.redirectToSanitized }
					/>
				</Main>
			);
		}

		if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
			let renderContent = this.renderGravPoweredMagicLogin();
			const hasSubHeader =
				isGravatarFlowOAuth2Client( oauth2Client ) ||
				( isGravatarOAuth2Client( oauth2Client ) &&
					( query?.gravatar_from === GRAVATAR_FROM_3RD_PARTY ||
						query?.gravatar_from === GRAVATAR_FROM_QUICK_EDITOR ) );

			if ( showSecondaryEmailOptions ) {
				renderContent = this.renderGravPoweredSecondaryEmailOptions();
			} else if ( showEmailCodeVerification ) {
				renderContent = this.renderGravPoweredEmailCodeVerification();
			} else if ( showEmailLinkVerification ) {
				renderContent = this.renderGravPoweredEmailLinkVerification();
			}

			return (
				<Main
					className={ clsx( 'grav-powered-magic-login', {
						'grav-powered-magic-login--has-sub-header': hasSubHeader,
						'grav-powered-magic-login--wp-job-manager': isWPJobManagerOAuth2Client( oauth2Client ),
					} ) }
				>
					{ renderContent }
				</Main>
			);
		}

		// "query?.redirect_to" is used to determine if Studio app users are creating a new account (vs. logging in)
		if ( isStudioAppOAuth2Client( oauth2Client ) && query?.redirect_to ) {
			return (
				<Main className="magic-login magic-login__request-link is-white-login">
					{ this.renderLocaleSuggestions() }

					<GlobalNotices id="notices" />

					<RequestLoginEmailForm
						headerText={ translate( 'Sign up for WordPress.com' ) }
						tosComponent={ this.renderStudioLoginTos() }
						subHeaderText={ translate(
							'Connecting a WordPress.com account unlocks additional Studio features like demo sites.'
						) }
						customFormLabel={ translate( 'Your email address' ) }
						submitButtonLabel={ translate( 'Send activation link' ) }
						createAccountForNewUser
					/>

					{ this.renderLinks() }
				</Main>
			);
		}

		// If this is part of the Jetpack login flow and the `jetpack/magic-link-signup` feature
		// flag is enabled, some steps will display a different UI
		const requestLoginEmailFormProps = {
			...( this.props.isJetpackLogin ? { flow: 'jetpack' } : {} ),
			...( this.props.isJetpackLogin && config.isEnabled( 'jetpack/magic-link-signup' )
				? { isJetpackMagicLinkSignUpEnabled: true }
				: {} ),
			createAccountForNewUser: true,
		};

		return (
			<Main className="magic-login magic-login__request-link is-white-login">
				{ this.props.isJetpackLogin && ! this.props.isFromAutomatticForAgenciesPlugin && (
					<JetpackHeader />
				) }
				{ this.renderGutenboardingLogo() }
				{ this.props.isFromAutomatticForAgenciesPlugin && (
					<A4ALogo fullA4A size={ 58 } className="magic-login__a4a-logo" />
				) }

				{ this.renderLocaleSuggestions() }

				<GlobalNotices id="notices" />

				<RequestLoginEmailForm { ...requestLoginEmailFormProps } />

				{ this.renderLinks() }
			</Main>
		);
	}
}

const mapState = ( state ) => ( {
	locale: getCurrentLocaleSlug( state ),
	query: getCurrentQueryArguments( state ),
	showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
	isSendingEmail: isFetchingMagicLoginEmail( state ),
	emailRequested: isMagicLoginEmailRequested( state ),
	isJetpackLogin: getCurrentRoute( state ) === '/log-in/jetpack/link',
	oauth2Client: getCurrentOAuth2Client( state ),
	userEmail:
		getLastCheckedUsernameOrEmail( state ) ||
		getCurrentQueryArguments( state ).email_address ||
		getInitialQueryArguments( state ).email_address,
	localeSuggestions: getLocaleSuggestions( state ),
	isWCCOM: getIsWCCOM( state ),
	isValidatingCode: isFetchingMagicLoginAuth( state ),
	isCodeValidated: getMagicLoginRequestedAuthSuccessfully( state ),
	codeValidationError: getMagicLoginRequestAuthError( state ),
	twoFactorEnabled: isTwoFactorEnabled( state ),
	twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
	redirectToSanitized: getRedirectToSanitized( state ),
	isFromAutomatticForAgenciesPlugin:
		'automattic-for-agencies-client' ===
		new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'from' ),
	isWooJPC: isWooJPCFlow( state ),
} );

const mapDispatch = {
	hideMagicLoginRequestForm,
	sendEmailLogin,
	fetchMagicLoginAuthenticate,
	rebootAfterLogin,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
	recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
	infoNotice,
	errorNotice,
	successNotice,
	removeNotice,
};

export default connect( mapState, mapDispatch )( localize( MagicLogin ) );
