import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { capitalize, get, isEmpty, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import A4APlusWpComLogo from 'calypso/a8c-for-agencies/components/a4a-plus-wpcom-logo';
import VisitSite from 'calypso/blocks/visit-site';
import AsyncLoad from 'calypso/components/async-load';
import GravatarLoginLogo from 'calypso/components/gravatar-login-logo';
import JetpackPlusWpComLogo from 'calypso/components/jetpack-plus-wpcom-logo';
import Notice from 'calypso/components/notice';
import WooCommerceConnectCartHeader from 'calypso/components/woocommerce-connect-cart-header';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import { preventWidows } from 'calypso/lib/formatting';
import getGravatarOAuth2Flow from 'calypso/lib/get-gravatar-oauth2-flow';
import { getSignupUrl, isReactLostPasswordScreenEnabled } from 'calypso/lib/login';
import {
	isCrowdsignalOAuth2Client,
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isWooOAuth2Client,
	isBlazeProOAuth2Client,
	isGravatarFlowOAuth2Client,
	isGravatarOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import { isWebAuthnSupported } from 'calypso/lib/webauthn';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { wasManualRenewalImmediateLoginAttempted } from 'calypso/state/immediate-login/selectors';
import { rebootAfterLogin } from 'calypso/state/login/actions';
import { hideMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import {
	getAuthAccountType,
	getRedirectToOriginal,
	getLastCheckedUsernameOrEmail,
	getRequestNotice,
	getRequestError,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
	isTwoFactorAuthTypeSupported,
	getSocialAccountIsLinking,
	getSocialAccountLinkService,
} from 'calypso/state/login/selectors';
import { isPasswordlessAccount, isPartnerSignupQuery } from 'calypso/state/login/utils';
import { logoutUser } from 'calypso/state/logout/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsWooPasswordless from 'calypso/state/selectors/get-is-woo-passwordless';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
import isFetchingMagicLoginEmail from 'calypso/state/selectors/is-fetching-magic-login-email';
import isMagicLoginEmailRequested from 'calypso/state/selectors/is-magic-login-email-requested';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import ContinueAsUser from './continue-as-user';
import ErrorNotice from './error-notice';
import LoginForm from './login-form';

import './style.scss';

/*
 * Parses the `anchor_podcast` parameter from a given URL.
 * Returns `true` if provided URL is an anchor FM signup URL.
 */
function getIsAnchorFmSignup( urlString ) {
	if ( ! urlString ) {
		return false;
	}

	// Assemble search params if there is actually a query in the string.
	const queryParamIndex = urlString.indexOf( '?' );
	if ( queryParamIndex === -1 ) {
		return false;
	}
	const searchParams = new URLSearchParams(
		decodeURIComponent( urlString.slice( queryParamIndex ) )
	);
	const anchorFmPodcastId = searchParams.get( 'anchor_podcast' );
	return Boolean( anchorFmPodcastId && anchorFmPodcastId.match( /^[0-9a-f]{7,8}$/i ) );
}

class Login extends Component {
	static propTypes = {
		disableAutoFocus: PropTypes.bool,
		isLinking: PropTypes.bool,
		isJetpack: PropTypes.bool.isRequired,
		isWhiteLogin: PropTypes.bool.isRequired,
		isJetpackWooCommerceFlow: PropTypes.bool.isRequired,
		isFromMigrationPlugin: PropTypes.bool,
		isFromAutomatticForAgenciesPlugin: PropTypes.bool,
		isManualRenewalImmediateLoginAttempt: PropTypes.bool,
		linkingSocialService: PropTypes.string,
		oauth2Client: PropTypes.object,
		privateSite: PropTypes.bool,
		rebootAfterLogin: PropTypes.func.isRequired,
		requestNotice: PropTypes.object,
		sendEmailLogin: PropTypes.func.isRequired,
		socialConnect: PropTypes.bool,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		twoFactorAuthType: PropTypes.string,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,
		isSecurityKeySupported: PropTypes.bool,
		userEmail: PropTypes.string,
		onSocialConnectStart: PropTypes.func,
		onTwoFactorRequested: PropTypes.func,
		signupUrl: PropTypes.string,
		redirectTo: PropTypes.string,
		isPartnerSignup: PropTypes.bool,
		loginEmailAddress: PropTypes.string,
		action: PropTypes.string,
		isGravPoweredClient: PropTypes.bool,
		isGravPoweredLoginPage: PropTypes.bool,
		isSignupExistingAccount: PropTypes.bool,
		emailRequested: PropTypes.bool,
		isSendingEmail: PropTypes.bool,
	};

	state = {
		isBrowserSupported: isWebAuthnSupported(),
	};

	static defaultProps = {
		isJetpack: false,
		isWhiteLogin: false,
		isJetpackWooCommerceFlow: false,
	};

	componentDidMount() {
		if ( ! this.props.twoFactorEnabled && this.props.twoFactorAuthType ) {
			// Disallow access to the 2FA pages unless the user has 2FA enabled
			page( login( { isJetpack: this.props.isJetpack, locale: this.props.locale } ) );
		}

		window.scrollTo( 0, 0 );
	}

	componentDidUpdate( prevProps ) {
		const hasNotice = this.props.requestNotice !== prevProps.requestNotice;
		const isNewPage = this.props.twoFactorAuthType !== prevProps.twoFactorAuthType;

		if ( isNewPage || hasNotice ) {
			window.scrollTo( 0, 0 );
		}

		if ( ! prevProps.accountType && isPasswordlessAccount( this.props.accountType ) ) {
			this.props.sendEmailLogin();
		}

		if (
			this.props.isJetpackWooDnaFlow &&
			this.props.requestError?.code === 'unknown_user' &&
			emailValidator.validate( this.props.usernameOrEmail )
		) {
			this.sendMagicLoginLink( {
				createAccount: true,
			} );
		}

		// Passwordless email link sent.
		if ( prevProps.isSendingEmail && this.props.emailRequested ) {
			this.handleTwoFactorRequested( 'link' );
		}

		if (
			this.props.requestError?.field === 'usernameOrEmail' &&
			this.props.requestError?.code === 'email_login_not_allowed'
		) {
			const magicLoginUrl = login( {
				locale: this.props.locale,
				twoFactorAuthType: 'link',
				oauth2ClientId: this.props.currentQuery?.client_id,
				redirectTo: this.props.redirectTo,
				usernameOnly: true,
			} );

			page( magicLoginUrl );
		}
	}

	sendMagicLoginLink = ( options = {} ) => {
		this.props.sendEmailLogin( options );
		this.handleTwoFactorRequested( 'link' );
	};

	showContinueAsUser = () => {
		const {
			isJetpack,
			isJetpackWooCommerceFlow,
			oauth2Client,
			privateSite,
			socialConnect,
			twoStepNonce,
			fromSite,
			currentUser,
			twoFactorEnabled,
			loginEmailAddress,
			isWoo,
			isBlazePro,
			isPartnerSignup,
		} = this.props;

		return (
			! twoStepNonce &&
			! socialConnect &&
			! privateSite &&
			// Show the continue as user flow WooCommerce and Blaze Pro but not for other OAuth2 clients
			! ( oauth2Client && ! ( isWoo && ! isPartnerSignup ) && ! isBlazePro ) &&
			! isJetpackWooCommerceFlow &&
			! isJetpack &&
			! fromSite &&
			! twoFactorEnabled &&
			! loginEmailAddress &&
			currentUser
		);
	};

	handleTwoFactorRequested = ( authType ) => {
		if ( this.props.onTwoFactorRequested ) {
			this.props.onTwoFactorRequested( authType );
		} else if ( this.props.isWoo || this.props.isGravPoweredClient ) {
			page(
				login( {
					isJetpack: this.props.isJetpack,
					// If no notification is sent, the user is using the authenticator for 2FA by default
					twoFactorAuthType: authType,
					locale: this.props.locale,
					isPartnerSignup: this.props.isPartnerSignup,
					// Pass oauth2 and redirectTo query params so that we can get the correct signup url for the user
					oauth2ClientId: this.props.oauth2Client?.id,
					redirectTo: this.props.redirectTo,
				} )
			);
		} else {
			page(
				login( {
					isJetpack: this.props.isJetpack,
					// If no notification is sent, the user is using the authenticator for 2FA by default
					twoFactorAuthType: authType,
					locale: this.props.locale,
					isPartnerSignup: this.props.isPartnerSignup,
				} )
			);
		}
	};

	handleSocialConnectStart = () => {
		if ( this.props.onSocialConnectStart ) {
			this.props.onSocialConnectStart();
		} else {
			page( login( { socialConnect: true, locale: this.props.locale } ) );
		}
	};

	handleValidLogin = () => {
		if ( this.props.twoFactorEnabled ) {
			let defaultAuthType;
			if (
				this.state.isBrowserSupported &&
				this.props.isSecurityKeySupported &&
				this.props.twoFactorNotificationSent !== 'push'
			) {
				defaultAuthType = 'webauthn';
			} else {
				defaultAuthType = this.props.twoFactorNotificationSent.replace( 'none', 'authenticator' );
			}
			this.handleTwoFactorRequested( defaultAuthType );
		} else if ( this.props.isLinking ) {
			this.handleSocialConnectStart();
		} else {
			this.rebootAfterLogin();
		}
	};

	handleValid2FACode = () => {
		if ( this.props.isLinking ) {
			this.handleSocialConnectStart();
		} else {
			this.rebootAfterLogin();
		}
	};

	handleContinueAsAnotherUser = () => {
		this.props.redirectToLogout( window.location.href );
	};

	rebootAfterLogin = () => {
		this.props.rebootAfterLogin( {
			social_service_connected: this.props.socialConnect,
		} );
	};

	getSignupLinkComponent = () => {
		const signupUrl = this.getSignupUrl();
		return (
			<a
				href={ signupUrl }
				onClick={ ( event ) => {
					// If the user is already logged in, log them out before sending them to the signup page. Otherwise, they will see the weird logged-in state on the signup page.
					if ( this.props.isLoggedIn ) {
						event.preventDefault();
						this.props.redirectToLogout( signupUrl );
					}
				} }
			/>
		);
	};

	getSignupUrl = () => {
		const {
			currentRoute,
			oauth2Client,
			currentQuery,
			initialQuery,
			pathname,
			locale,
			signupUrl,
			isWoo,
			isWooCoreProfilerFlow,
			isWooPasswordless,
		} = this.props;

		if ( signupUrl ) {
			return signupUrl;
		}

		if ( isWoo && isEmpty( currentQuery ) ) {
			// if query is empty, return to the woo start flow
			return 'https://woocommerce.com/start/';
		}

		if ( isWooCoreProfilerFlow && isEmpty( currentQuery ) ) {
			return getSignupUrl( initialQuery, currentRoute, oauth2Client, locale, pathname );
		}

		if ( isWooPasswordless ) {
			return addQueryArgs(
				{ 'woo-passwordless': 'yes' },
				getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname )
			);
		}

		return getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname );
	};

	renderHeader() {
		const {
			action,
			currentQuery,
			fromSite,
			isAnchorFmSignup,
			isFromMigrationPlugin,
			isFromAutomatticForAgenciesPlugin,
			isGravPoweredClient,
			isGravPoweredLoginPage,
			isJetpack,
			isJetpackWooCommerceFlow,
			isManualRenewalImmediateLoginAttempt,
			isP2Login,
			isPartnerSignup,
			isSignupExistingAccount,
			isSocialFirst,
			isWhiteLogin,
			isWoo,
			isWooCoreProfilerFlow,
			linkingSocialService,
			oauth2Client,
			privateSite,
			socialConnect,
			translate,
			twoStepNonce,
			wccomFrom,
		} = this.props;

		let headerText = translate( 'Log in to your account' );
		let preHeader = null;
		let postHeader = null;
		const signupLink = this.getSignupLinkComponent();

		if ( isSocialFirst ) {
			headerText = translate( 'Log in to WordPress.com' );
		}

		if ( isManualRenewalImmediateLoginAttempt ) {
			headerText = translate( 'Log in to update your payment details and renew your subscription' );
		}

		if ( twoStepNonce ) {
			headerText = translate( 'Two-Step Authentication' );
		} else if ( socialConnect ) {
			headerText = translate( 'Connect your %(service)s account', {
				args: {
					service: capitalize( linkingSocialService ),
				},
			} );
		} else if ( action === 'lostpassword' ) {
			headerText = <h3>{ translate( 'Forgot your password?' ) }</h3>;
			postHeader = (
				<p className="login__header-subtitle login__lostpassword-subtitle">
					{ translate(
						'It happens to the best of us. Enter the email address associated with your WordPress.com account and we’ll send you a link to reset your password.'
					) }
					{ isWooCoreProfilerFlow && (
						<span>
							<br />
							{ translate( 'Don’t have an account? {{signupLink}}Sign up{{/signupLink}}', {
								components: {
									signupLink,
								},
							} ) }
						</span>
					) }
				</p>
			);
			if ( this.props.isBlazePro ) {
				postHeader = (
					<p className="login__header-subtitle login__lostpassword-subtitle">
						{ translate(
							'It happens to the best of us. Enter the email address associated with your Blaze Pro account and we’ll send you a link to reset your password.'
						) }
					</p>
				);
			}
		} else if ( privateSite ) {
			headerText = translate( 'This is a private WordPress.com site' );
		} else if ( oauth2Client ) {
			headerText = translate( 'Howdy! Log in to %(clientTitle)s with your WordPress.com account.', {
				args: {
					clientTitle: oauth2Client.title,
				},
				comment:
					"'clientTitle' is the name of the app that uses WordPress.com authentication (e.g. 'Akismet' or 'VaultPress')",
			} );

			if ( isWoo ) {
				if ( isPartnerSignup ) {
					headerText = translate( 'Log in to your account' );
				} else if ( wccomFrom === 'cart' ) {
					preHeader = <WooCommerceConnectCartHeader />;
					headerText = translate( 'Log in with a WordPress.com account' );
					postHeader = (
						<p className="login__header-subtitle">
							{ translate(
								'Log in to WooCommerce.com with your WordPress.com account to connect your store and manage your extensions'
							) }
						</p>
					);
				} else if ( this.props.twoFactorEnabled ) {
					headerText = <h3>{ translate( 'Authenticate your login' ) }</h3>;
				} else if ( currentQuery.lostpassword_flow ) {
					headerText = null;
					postHeader = (
						<p className="login__header-subtitle">
							{ translate(
								"Your password reset confirmation is on its way to your email address – please check your junk folder if it's not in your inbox! Once you've reset your password, head back to this page to log in to your account."
							) }
						</p>
					);
				} else if ( this.showContinueAsUser() && this.props.isWooPasswordless ) {
					headerText = (
						<h3>
							{ wccomFrom === 'nux'
								? translate( 'Get started in minutes' )
								: translate( 'Log in to your account' ) }
						</h3>
					);
					postHeader = (
						<p className="login__header-subtitle">
							{ wccomFrom === 'nux'
								? translate( 'First, select the account you’d like to use.' )
								: translate( 'Select the account you’d like to use.' ) }
						</p>
					);
				} else if ( this.props.isWooPasswordless ) {
					headerText = <h3>{ translate( 'Log in to your account' ) }</h3>;
					const poweredByWpCom = (
						<>
							{ translate( 'Log in with your WordPress.com account.' ) }
							<br />
						</>
					);

					postHeader = (
						<p className="login__header-subtitle">
							{ poweredByWpCom }
							{ translate( "Don't have an account? {{signupLink}}Sign up{{/signupLink}}", {
								components: {
									signupLink,
									br: <br />,
								},
							} ) }
						</p>
					);
				} else {
					headerText = <h3>{ translate( "Let's get started" ) }</h3>;
					const poweredByWpCom =
						wccomFrom === 'nux' ? (
							<>
								{ translate( 'All Woo Express stores are powered by WordPress.com!' ) }
								<br />
							</>
						) : null;
					const accountSelectionOrLoginToContinue = this.showContinueAsUser()
						? translate( "First, select the account you'd like to use." )
						: translate(
								"Please, log in to continue. Don't have an account? {{signupLink}}Sign up{{/signupLink}}",
								{
									components: {
										signupLink,
										br: <br />,
									},
								}
						  );
					postHeader = (
						<p className="login__header-subtitle">
							{ poweredByWpCom }
							{ accountSelectionOrLoginToContinue }
						</p>
					);
				}
			}

			if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
				headerText = translate( 'Howdy! Log in to Jetpack.com with your WordPress.com account.' );
				preHeader = (
					<div>
						<JetpackPlusWpComLogo className="login__jetpack-plus-wpcom-logo" size={ 24 } />
					</div>
				);
			}

			if ( isA4AOAuth2Client( oauth2Client ) ) {
				headerText = translate(
					'Howdy! Log in to Automattic for Agencies with your WordPress.com{{nbsp/}}account.',
					{
						components: { nbsp: <>&nbsp;</> },
						comment: 'The {{nbsp/}} is a non-breaking space',
					}
				);
				preHeader = (
					<div>
						<A4APlusWpComLogo className="login__a4a-plus-wpcom-logo" size={ 32 } />
					</div>
				);
			}

			if ( isJetpackCloudOAuth2Client( oauth2Client ) || isA4AOAuth2Client( oauth2Client ) ) {
				// If users arrived here from the lost password flow, show them a specific message about it
				postHeader = currentQuery.lostpassword_flow && (
					<p className="login__form-post-header">
						{ translate(
							'Check your e-mail address linked to the account for the confirmation link, including the spam or junk folder.'
						) }
					</p>
				);
			}

			if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
				headerText = translate( 'Sign in to %(clientTitle)s', {
					args: {
						clientTitle: oauth2Client.title,
					},
				} );
			}

			if ( isGravPoweredClient ) {
				headerText = translate( 'Login to %(clientTitle)s', {
					args: { clientTitle: oauth2Client.title },
				} );

				if ( isGravPoweredLoginPage ) {
					const isFromGravatar3rdPartyApp =
						isGravatarOAuth2Client( oauth2Client ) && currentQuery?.gravatar_from === '3rd-party';

					postHeader = (
						<p className="login__header-subtitle">
							{ isFromGravatar3rdPartyApp
								? translate( 'Please log in with your email and password.' )
								: translate(
										'If you prefer logging in with a password, or a social media account, choose below:'
								  ) }
						</p>
					);
				}
			}

			if ( isBlazeProOAuth2Client( oauth2Client ) ) {
				headerText = <h3>{ translate( 'Log in to your Blaze Pro account' ) }</h3>;

				postHeader = (
					<p className="login__header-subtitle">
						{ translate( "Don't have an account? {{signupLink}}Sign up here{{/signupLink}}", {
							components: { signupLink },
						} ) }
					</p>
				);

				if ( this.showContinueAsUser() ) {
					postHeader = (
						<p className="login__header-subtitle">
							{ translate( 'Select the account you’d like to use' ) }
						</p>
					);
				}
			}
		} else if ( isWooCoreProfilerFlow ) {
			const isLostPasswordFlow = currentQuery.lostpassword_flow;
			const isTwoFactorAuthFlow = this.props.twoFactorEnabled;

			let subtitle = null;

			switch ( true ) {
				case isLostPasswordFlow:
					headerText = null;
					subtitle = translate(
						"Your password reset confirmation is on its way to your email address – please check your junk folder if it's not in your inbox! Once you've reset your password, head back to this page to log in to your account."
					);
					break;
				case isTwoFactorAuthFlow:
					headerText = <h3>{ translate( 'Authenticate your login' ) }</h3>;
					break;
				default:
					headerText = <h3>{ translate( 'One last step' ) }</h3>;
					subtitle = translate(
						"In order to take advantage of the benefits offered by Jetpack, please log in to your WordPress.com account below. Don't have an account? {{signupLink}}Sign up{{/signupLink}}",
						{
							components: {
								signupLink,
							},
						}
					);
			}
			preHeader = null;
			postHeader = <p className="login__header-subtitle">{ subtitle }</p>;
		} else if ( isJetpackWooCommerceFlow ) {
			headerText = translate( 'Log in to your WordPress.com account' );
			preHeader = (
				<div className="login__jetpack-logo">
					<AsyncLoad
						require="calypso/components/jetpack-header"
						placeholder={ null }
						partnerSlug={ this.props.partnerSlug }
						isWoo
						width={ 200 }
						lightColorScheme
					/>
				</div>
			);
			postHeader = (
				<p className="login__header-subtitle">
					{ translate(
						'Your account will enable you to start using the features and benefits offered by Jetpack & WooCommerce Services.'
					) }
				</p>
			);
		} else if ( isFromMigrationPlugin ) {
			headerText = translate( 'Log in to your account' );
		} else if ( isJetpack ) {
			const isJetpackMagicLinkSignUpFlow = config.isEnabled( 'jetpack/magic-link-signup' );
			headerText = isJetpackMagicLinkSignUpFlow
				? translate( 'Log in or create a WordPress.com account to get started with Jetpack' )
				: translate( 'Log in or create a WordPress.com account to set up Jetpack' );
			preHeader = (
				<div className="login__jetpack-logo">
					<AsyncLoad
						require="calypso/components/jetpack-header"
						placeholder={ null }
						partnerSlug={ this.props.partnerSlug }
						darkColorScheme
					/>
				</div>
			);
		} else if ( isAnchorFmSignup ) {
			postHeader = (
				<p className="login__header-subtitle">
					{ translate(
						'Log in to your WordPress.com account to transcribe and save your Anchor.fm podcasts.'
					) }
				</p>
			);
		} else if ( fromSite ) {
			// if redirected from Calypso URL with a site slug, offer a link to that site's frontend
			postHeader = <VisitSite siteSlug={ fromSite } />;
		} else if ( isP2Login ) {
			headerText = translate( 'Log in' );
			postHeader = (
				<p className="login__header-subtitle">
					{ translate( 'Enter your details to log in to your account.' ) }
				</p>
			);
		} else if ( isSignupExistingAccount ) {
			headerText = preventWidows( translate( 'Log in to your existing account' ) );
		}

		if ( isWhiteLogin && ! isBlazeProOAuth2Client( oauth2Client ) ) {
			preHeader = (
				<div className="login__form-gutenboarding-wordpress-logo">
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

		if ( isFromAutomatticForAgenciesPlugin ) {
			headerText = translate( 'Log in to Automattic for Agencies' );
			preHeader = (
				<svg
					width="282"
					height="58"
					viewBox="0 0 282 58"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g clipPath="url(#clip0_6816_1592)">
						<path
							d="M107.202 19.4164C100.972 19.4164 96.9319 14.8051 96.9319 10.0056V9.41077C96.9319 4.52998 100.972 0 107.202 0C113.431 0 117.506 4.52998 117.506 9.41077V10.0056C117.506 14.8051 113.465 19.4164 107.202 19.4164ZM114.174 9.46162C114.174 5.96372 111.698 2.85221 107.202 2.85221C102.706 2.85221 100.269 5.9688 100.269 9.46162V9.89885C100.269 13.3968 102.745 16.5693 107.202 16.5693C111.658 16.5693 114.174 13.3968 114.174 9.89885V9.46162Z"
							fill="#3499CD"
						/>
						<path
							d="M36.8237 18.7097L34.5013 14.2356H24.1722L21.9093 18.7097H18.4431L27.9503 0.650772H30.6985L40.3641 18.7097H36.8237ZM29.2427 4.17409L25.4151 11.7698H33.204L29.2427 4.17409ZM55.3627 19.4164C49.0493 19.4164 46.1179 15.888 46.1179 11.2004V0.650772H49.3959V11.2512C49.3959 14.5864 51.5351 16.5693 55.6004 16.5693C59.7746 16.5693 61.4879 14.5864 61.4879 11.2512V0.650772H64.7906V11.1851C64.7906 15.6745 62.0177 19.4164 55.3627 19.4164ZM83.1712 3.47248V18.7249H79.8685V3.47248H72.1835V0.650772H90.8562V3.47248H83.1712ZM146.924 18.7097V4.41813L146.052 5.99422L138.684 18.7046H137.075L129.786 5.99422L128.915 4.41813V18.7097H125.691V0.650772H130.261L137.194 13.0409L138.016 14.5661L138.833 13.0409L145.701 0.650772H150.217V18.7097H146.924ZM175.183 18.7097L172.856 14.2356H162.536L160.293 18.7097H156.827L166.334 0.650772H169.078L178.718 18.7097H175.183ZM167.602 4.17409L163.774 11.7698H171.563L167.602 4.17409ZM192.028 3.47248V18.7249H188.731V3.47248H181.046V0.650772H199.713V3.47248H192.028ZM216.247 3.47248V18.7249H212.944V3.47248H205.259V0.650772H223.937V3.47248H216.247ZM232.068 18.7097V2.35905C233.385 2.35905 233.915 1.62693 233.915 0.650772H235.326V18.7097H232.068ZM261.169 5.75018C259.274 3.89647 256.759 2.85774 254.142 2.84713C249.443 2.84713 246.799 6.15691 246.799 9.59889V9.94969C246.799 13.3662 249.468 16.5591 254.38 16.5591C256.95 16.5094 259.409 15.4738 261.272 13.656L263.253 15.7965C260.782 18.1608 257.519 19.4572 254.142 19.4164C247.487 19.4164 243.447 14.9678 243.447 10.087V9.49212C243.447 4.61133 247.858 0 254.301 0C258.024 0 261.406 1.60151 263.214 3.60467L261.169 5.75018ZM107.609 6.69736L104.585 11.507C104.401 11.7992 104.338 12.1544 104.409 12.4945C104.48 12.8346 104.68 13.1317 104.964 13.3205L104.969 13.323C105.11 13.4165 105.267 13.4805 105.432 13.5114C105.597 13.5424 105.767 13.5397 105.931 13.5034C106.095 13.4671 106.25 13.3981 106.388 13.3001C106.526 13.2022 106.644 13.0773 106.735 12.9326L109.76 8.12296C109.943 7.83073 110.006 7.47559 109.935 7.13561C109.864 6.79563 109.664 6.49865 109.379 6.30995L109.375 6.3069C109.234 6.21345 109.076 6.14943 108.911 6.11848C108.746 6.08753 108.577 6.09027 108.413 6.12653C108.249 6.16278 108.094 6.23186 107.956 6.3298C107.818 6.42774 107.7 6.55264 107.609 6.69736Z"
							fill="black"
						/>
					</g>
					<path
						d="M18.5267 34.8197H5.95136L5.95136 39.941H15.3091V42.5955H5.95136L5.95136 49.8887H2.62653L2.62653 32.0311H18.5267V34.8197ZM45.7091 41.2817C45.7091 46.0276 41.6067 50.5858 35.252 50.5858C28.9241 50.5858 24.8217 46.0276 24.8217 41.2817V40.6918C24.8217 35.8654 28.9241 31.3876 35.252 31.3876C41.6067 31.3876 45.7091 35.8654 45.7091 40.6918V41.2817ZM42.3307 41.1744V40.7454C42.3307 37.2865 39.8102 34.203 35.252 34.203C30.6938 34.203 28.2002 37.2865 28.2002 40.7454V41.1744C28.2002 44.6333 30.6938 47.7704 35.252 47.7704C39.8102 47.7704 42.3307 44.6333 42.3307 41.1744ZM72.1649 49.8887H69.135C68.2234 49.8887 67.8212 48.6285 67.7139 47.0197L67.6066 45.1964C67.4994 43.4267 66.7754 42.6759 63.4238 42.6759H57.0959V49.8887H53.7443V32.0311H63.4774C68.8401 32.0311 71.2532 34.1762 71.2532 36.9379C71.2532 38.8953 70.2611 40.7454 66.7754 41.3889C70.2611 41.657 71.0119 43.239 71.0387 45.3304L71.0655 46.8052C71.0924 48.0386 71.3069 48.9234 72.1649 49.8082V49.8887ZM67.8748 37.5815V37.3669C67.8748 36.0799 66.8291 34.8197 63.9601 34.8197H57.0959V40.1823H64.255C66.7218 40.1823 67.8748 39.0025 67.8748 37.5815ZM112.979 49.8887H109.386L107.026 45.4645H96.5422L94.2631 49.8887H90.7237L100.376 32.0311H103.165L112.979 49.8887ZM105.712 43.0245L101.69 35.5168L97.8024 43.0245H105.712ZM138.163 49.8887H136.018L135.509 47.4755C133.793 49.4597 131.353 50.5858 128.323 50.5858C121.995 50.5858 117.893 46.2421 117.893 41.2817V40.9599C117.893 35.8922 122.37 31.3876 128.913 31.3876C132.935 31.3876 136.206 33.05 137.976 34.9538L135.884 37.072C134.275 35.5973 131.782 34.203 128.886 34.203C123.899 34.203 121.271 37.3938 121.271 40.8795V41.1744C121.271 44.6601 124.086 47.7704 128.645 47.7704C132.103 47.7704 134.57 45.6522 134.57 43.5072V43.3195H129.074V40.665H138.163V49.8887ZM162.854 49.8887L146.632 49.8887V32.0311L162.854 32.0311V34.8197L149.983 34.8197V39.4047L159.877 39.4047V42.1129L149.983 42.1129V47.1001L162.854 47.1001V49.8887ZM190.009 49.8887L187.113 49.8887L175.503 37.93L174.377 36.6698V49.8887H171.025V32.0311H174.243L185.505 43.963L186.658 45.25V32.0311H190.009V49.8887ZM218.148 34.9538L216.056 37.072C214.448 35.5973 212.088 34.203 208.897 34.203C204.125 34.203 201.443 37.4742 201.443 40.8795V41.228C201.443 44.6065 204.151 47.7704 209.139 47.7704C212.115 47.7704 214.582 46.3493 216.137 44.9014L218.148 47.0197C216.19 48.9502 212.866 50.5858 208.924 50.5858C202.167 50.5858 198.065 46.1885 198.065 41.3621V40.7722C198.065 35.9459 202.543 31.3876 209.085 31.3876C212.866 31.3876 216.298 32.9696 218.148 34.9538ZM229.292 49.8887H225.94V32.0311H229.292V49.8887ZM254.642 49.8887H238.42V32.0311H254.642V34.8197H241.771V39.4047H251.665V42.1129H241.771V47.1001H254.642V49.8887ZM280.51 44.8746C280.51 48.3603 276.702 50.5858 271.393 50.5858C267.774 50.5858 264.422 49.5937 261.66 48.2799L262.894 45.6254C265.709 47.0197 268.685 47.8509 271.554 47.8509C275.415 47.8509 277.131 46.5907 277.131 45.2232C277.131 40.9599 262.17 43.8021 262.17 37.2597C262.17 33.9349 265.763 31.3876 271.42 31.3876C274.933 31.3876 278.204 32.621 280.215 33.9349L278.392 36.1872C276.729 35.1146 273.994 34.1226 271.313 34.1226C267.827 34.1226 265.521 35.3023 265.521 36.8307C265.521 40.7186 280.51 38.1177 280.51 44.8746Z"
						fill="black"
					/>
					<defs>
						<clipPath id="clip0_6816_1592">
							<rect width="244.785" height="19.4164" fill="white" transform="translate(18.4431)" />
						</clipPath>
					</defs>
				</svg>
			);
		}

		return (
			<div className="login__form-header-wrapper">
				{ isGravPoweredClient && (
					<GravatarLoginLogo
						iconUrl={ oauth2Client.icon }
						alt={ oauth2Client.title }
						isCoBrand={ isGravatarFlowOAuth2Client( oauth2Client ) }
					/>
				) }
				{ preHeader }
				<div className="login__form-header">{ headerText }</div>
				{ postHeader }
			</div>
		);
	}

	renderToS() {
		const { isSocialFirst, translate, twoFactorAuthType } = this.props;
		if ( ! isSocialFirst || twoFactorAuthType ) {
			return null;
		}

		const tos = translate(
			'Just a little reminder that by continuing with any of the options below, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
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

		return <div className="login__form-subheader-terms">{ tos }</div>;
	}

	renderNotice() {
		const { requestNotice } = this.props;

		if ( ! requestNotice ) {
			return null;
		}

		return (
			<Notice status={ requestNotice.status } showDismiss={ false }>
				{ requestNotice.message }
			</Notice>
		);
	}

	renderContent() {
		const {
			domain,
			isJetpack,
			isP2Login,
			privateSite,
			twoFactorAuthType,
			twoFactorEnabled,
			twoFactorNotificationSent,
			socialConnect,
			socialService,
			socialServiceResponse,
			disableAutoFocus,
			locale,
			userEmail,
			handleUsernameChange,
			signupUrl,
			isWoo,
			isWooPasswordless,
			isBlazePro,
			translate,
			isPartnerSignup,
			action,
			isWooCoreProfilerFlow,
			currentQuery,
			isGravPoweredClient,
			isSignupExistingAccount,
			isSocialFirst,
			isFromAutomatticForAgenciesPlugin,
			currentUser,
			redirectTo,
		} = this.props;

		const signupLink = this.getSignupLinkComponent();

		if ( socialConnect ) {
			return (
				<AsyncLoad
					require="calypso/blocks/login/social-connect-prompt"
					onSuccess={ this.handleValidLogin }
				/>
			);
		}

		if ( action === 'lostpassword' && isReactLostPasswordScreenEnabled() ) {
			return (
				<Fragment>
					<AsyncLoad
						require="calypso/blocks/login/lost-password-form"
						redirectToAfterLoginUrl={ this.props.redirectTo }
						oauth2ClientId={ this.props.oauth2Client && this.props.oauth2Client.id }
						locale={ locale }
						isWooCoreProfilerFlow={ isWooCoreProfilerFlow }
						from={ get( currentQuery, 'from' ) }
					/>
					{ ! isWooCoreProfilerFlow && ! isBlazePro && (
						<div className="login__lost-password-footer">
							<p className="login__lost-password-no-account">
								{ translate( 'Don’t have an account? {{signupLink}}Sign up{{/signupLink}}', {
									components: {
										signupLink,
									},
								} ) }
							</p>
						</div>
					) }
					{ isBlazePro && (
						<div className="login__lost-password-footer">
							<p className="login__lost-password-no-account">
								<span>{ translate( 'Don’t have an account?' ) }&nbsp;</span>
								{ translate( '{{signupLink}}Sign up{{/signupLink}}', {
									components: {
										signupLink,
									},
								} ) }
							</p>
						</div>
					) }
				</Fragment>
			);
		}

		if ( twoFactorEnabled && twoFactorAuthType ) {
			return (
				<Fragment>
					<AsyncLoad
						require="calypso/blocks/login/two-factor-authentication/two-factor-content"
						isBrowserSupported={ this.state.isBrowserSupported }
						isJetpack={ isJetpack }
						isWoo={ isWoo }
						isBlazePro={ isBlazePro }
						isPartnerSignup={ isPartnerSignup }
						isGravPoweredClient={ isGravPoweredClient }
						twoFactorAuthType={ twoFactorAuthType }
						twoFactorNotificationSent={ twoFactorNotificationSent }
						handleValid2FACode={ this.handleValid2FACode }
						rebootAfterLogin={ this.rebootAfterLogin }
						switchTwoFactorAuthType={ this.handleTwoFactorRequested }
					/>
					{ ( isWoo || isWooCoreProfilerFlow ) && ! isPartnerSignup && (
						<div className="login__two-factor-footer">
							<p className="login__two-factor-no-account">
								{ translate( 'Don’t have an account? {{signupLink}}Sign up{{/signupLink}}', {
									components: {
										signupLink,
									},
								} ) }
							</p>
							<p className="login__two-factor-cannot-access-phone">
								{ translate(
									'Can’t access your phone? {{contactUsLink}}Contact us{{/contactUsLink}}',
									{
										components: {
											contactUsLink: (
												<a
													href="https://wordpress.com/help/contact"
													target="_blank"
													rel="noreferrer"
												/>
											),
										},
									}
								) }
							</p>
						</div>
					) }
				</Fragment>
			);
		}

		if ( this.showContinueAsUser() ) {
			if ( isWoo ) {
				return (
					<div className="login__body login__body--continue-as-user">
						<ContinueAsUser
							currentUser={ currentUser }
							onChangeAccount={ this.handleContinueAsAnotherUser }
							redirectPath={ redirectTo }
							isWoo={ isWoo }
							isWooPasswordless={ isWooPasswordless }
						/>
						<LoginForm
							disableAutoFocus={ disableAutoFocus }
							onSuccess={ this.handleValidLogin }
							privateSite={ privateSite }
							socialService={ socialService }
							socialServiceResponse={ socialServiceResponse }
							domain={ domain }
							isP2Login={ isP2Login }
							locale={ locale }
							userEmail={ userEmail }
							handleUsernameChange={ handleUsernameChange }
							signupUrl={ signupUrl }
							showSocialLoginFormOnly
							sendMagicLoginLink={ this.sendMagicLoginLink }
							isFromAutomatticForAgenciesPlugin={ isFromAutomatticForAgenciesPlugin }
						/>
					</div>
				);
			}
			if ( isBlazePro ) {
				return (
					<div className="login__body login__body--continue-as-user">
						<ContinueAsUser
							currentUser={ currentUser }
							onChangeAccount={ this.handleContinueAsAnotherUser }
							redirectPath={ redirectTo }
							isBlazePro={ isBlazePro }
						/>
						<LoginForm
							disableAutoFocus={ disableAutoFocus }
							onSuccess={ this.handleValidLogin }
							privateSite={ privateSite }
							socialService={ socialService }
							socialServiceResponse={ socialServiceResponse }
							domain={ domain }
							isP2Login={ isP2Login }
							locale={ locale }
							userEmail={ userEmail }
							handleUsernameChange={ handleUsernameChange }
							signupUrl={ signupUrl }
							showSocialLoginFormOnly
							sendMagicLoginLink={ this.sendMagicLoginLink }
							isFromAutomatticForAgenciesPlugin={ isFromAutomatticForAgenciesPlugin }
						/>
					</div>
				);
			}

			// someone is already logged in, offer to proceed to the app without a new login
			return (
				<ContinueAsUser
					currentUser={ currentUser }
					onChangeAccount={ this.handleContinueAsAnotherUser }
					redirectPath={ redirectTo }
				/>
			);
		}

		return (
			<LoginForm
				disableAutoFocus={ disableAutoFocus }
				onSuccess={ this.handleValidLogin }
				privateSite={ privateSite }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
				domain={ domain }
				isP2Login={ isP2Login }
				locale={ locale }
				userEmail={ userEmail }
				handleUsernameChange={ handleUsernameChange }
				signupUrl={ signupUrl }
				hideSignupLink={ isGravPoweredClient || isBlazePro }
				isSignupExistingAccount={ isSignupExistingAccount }
				sendMagicLoginLink={ this.sendMagicLoginLink }
				isSendingEmail={ this.props.isSendingEmail }
				isSocialFirst={ isSocialFirst }
				isJetpack={ isJetpack }
				isFromAutomatticForAgenciesPlugin={ isFromAutomatticForAgenciesPlugin }
			/>
		);
	}

	renderFooter() {
		return ! this.showContinueAsUser() && this.props.footer;
	}

	render() {
		const { isJetpack, oauth2Client, locale, isWoo, isFromAutomatticForAgenciesPlugin } =
			this.props;

		return (
			<div
				className={ clsx( 'login', {
					'is-jetpack': isJetpack,
					'is-jetpack-cloud': isJetpackCloudOAuth2Client( oauth2Client ),
					'is-automattic-for-agencies-flow': isFromAutomatticForAgenciesPlugin,
					'is-a4a': isA4AOAuth2Client( oauth2Client ),
				} ) }
			>
				{ this.renderHeader() }

				{ /* For Woo, we render the ErrrorNotice component in login-form.jsx */ }
				{ ! isWoo && <ErrorNotice locale={ locale } /> }

				{ this.renderNotice() }

				{ this.renderToS() }

				{ this.renderContent() }

				{ this.renderFooter() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		accountType: getAuthAccountType( state ),
		redirectTo: getRedirectToOriginal( state ),
		usernameOrEmail: getLastCheckedUsernameOrEmail( state ),
		currentUser: getCurrentUser( state ),
		requestNotice: getRequestNotice( state ),
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
		oauth2Client: getCurrentOAuth2Client( state ),
		isLinking: getSocialAccountIsLinking( state ),
		isManualRenewalImmediateLoginAttempt: wasManualRenewalImmediateLoginAttempted( state ),
		isSecurityKeySupported: isTwoFactorAuthTypeSupported( state, 'webauthn' ),
		linkingSocialService: getSocialAccountLinkService( state ),
		partnerSlug: getPartnerSlugFromQuery( state ),
		isFromAutomatticForAgenciesPlugin:
			'automattic-for-agencies-client' === get( getCurrentQueryArguments( state ), 'from' ),
		isJetpackWooDnaFlow: wooDnaConfig( getCurrentQueryArguments( state ) ).isWooDnaFlow(),
		isJetpackWooCommerceFlow:
			'woocommerce-onboarding' === get( getCurrentQueryArguments( state ), 'from' ),
		isWooCoreProfilerFlow: isWooCommerceCoreProfilerFlow( state ),
		wccomFrom: getWccomFrom( state ),
		isWooPasswordless: getIsWooPasswordless( state ),
		isAnchorFmSignup: getIsAnchorFmSignup(
			get( getCurrentQueryArguments( state ), 'redirect_to' )
		),
		isFromMigrationPlugin: startsWith(
			get( getCurrentQueryArguments( state ), 'from' ),
			'wpcom-migration'
		),
		currentQuery: getCurrentQueryArguments( state ),
		initialQuery: getInitialQueryArguments( state ),
		currentRoute: getCurrentRoute( state ),
		isPartnerSignup: isPartnerSignupQuery( getCurrentQueryArguments( state ) ),
		loginEmailAddress: getCurrentQueryArguments( state )?.email_address,
		isWoo: isWooOAuth2Client( getCurrentOAuth2Client( state ) ),
		isBlazePro: isBlazeProOAuth2Client( getCurrentOAuth2Client( state ) ),
		isSignupExistingAccount: !! (
			getInitialQueryArguments( state )?.is_signup_existing_account ||
			getCurrentQueryArguments( state )?.is_signup_existing_account
		),
		requestError: getRequestError( state ),
		isSendingEmail: isFetchingMagicLoginEmail( state ),
		emailRequested: isMagicLoginEmailRequested( state ),
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{
		rebootAfterLogin,
		hideMagicLoginRequestForm,
		sendEmailLogin,
		logoutUser,
		redirectToLogout,
	},
	( stateProps, dispatchProps, ownProps ) => ( {
		...ownProps,
		...stateProps,
		...dispatchProps,
		sendEmailLogin: ( options = {} ) =>
			dispatchProps.sendEmailLogin( stateProps.usernameOrEmail, {
				redirectTo: stateProps.redirectTo,
				loginFormFlow: true,
				showGlobalNotices: false,
				flow:
					( ownProps.isJetpack && 'jetpack' ) ||
					( ownProps.isGravPoweredClient && getGravatarOAuth2Flow( ownProps.oauth2Client ) ) ||
					null,
				...options,
			} ),
	} )
)( localize( Login ) );
