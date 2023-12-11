import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { capitalize, get, isEmpty, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import VisitSite from 'calypso/blocks/visit-site';
import AsyncLoad from 'calypso/components/async-load';
import JetpackPlusWpComLogo from 'calypso/components/jetpack-plus-wpcom-logo';
import Notice from 'calypso/components/notice';
import WooCommerceConnectCartHeader from 'calypso/components/woocommerce-connect-cart-header';
import { preventWidows } from 'calypso/lib/formatting';
import { getSignupUrl, isReactLostPasswordScreenEnabled } from 'calypso/lib/login';
import {
	isCrowdsignalOAuth2Client,
	isJetpackCloudOAuth2Client,
	isWooOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import { isWebAuthnSupported } from 'calypso/lib/webauthn';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
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
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';
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
		continueAsAnotherUser: false,
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
				redirectTo: this.props.currentQuery?.redirect_to,
			} );

			page( magicLoginUrl );
		}
	}

	sendMagicLoginLink = () => {
		this.props.sendEmailLogin();
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
			isPartnerSignup,
		} = this.props;

		return (
			! twoStepNonce &&
			! socialConnect &&
			! privateSite &&
			// Show the continue as user flow WooCommerce but not other OAuth2 clients
			! ( oauth2Client && ! ( isWoo && ! isPartnerSignup ) ) &&
			! isJetpackWooCommerceFlow &&
			! isJetpack &&
			! fromSite &&
			! twoFactorEnabled &&
			! loginEmailAddress &&
			currentUser &&
			! this.state.continueAsAnotherUser
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
		this.setState( { continueAsAnotherUser: true } );
	};

	rebootAfterLogin = () => {
		this.props.rebootAfterLogin( {
			social_service_connected: this.props.socialConnect,
		} );
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

		return getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname );
	};

	renderHeader() {
		const {
			isJetpack,
			isWhiteLogin,
			isJetpackWooCommerceFlow,
			isFromMigrationPlugin,
			isP2Login,
			wccomFrom,
			isManualRenewalImmediateLoginAttempt,
			linkingSocialService,
			oauth2Client,
			privateSite,
			socialConnect,
			translate,
			twoStepNonce,
			fromSite,
			isAnchorFmSignup,
			isPartnerSignup,
			isWoo,
			action,
			currentQuery,
			isGravPoweredClient,
			isGravPoweredLoginPage,
			isWooCoreProfilerFlow,
			isSignupExistingAccount,
		} = this.props;

		let headerText = translate( 'Log in to your account' );
		let preHeader = null;
		let postHeader = null;

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
									signupLink: <a href={ this.getSignupUrl() } />,
								},
							} ) }
						</span>
					) }
				</p>
			);
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
				} else if ( wccomFrom ) {
					preHeader = (
						<Fragment>
							{ 'cart' === wccomFrom ? (
								<WooCommerceConnectCartHeader />
							) : (
								<div className="login__woocommerce-wrapper">
									<div className={ classNames( 'login__woocommerce-logo' ) }>
										<svg width={ 200 } viewBox="0 0 1270 170">
											<AsyncLoad
												require="calypso/components/jetpack-header/woocommerce"
												darkColorScheme={ false }
												placeholder={ null }
											/>
										</svg>
									</div>
								</div>
							) }
						</Fragment>
					);
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
				} else {
					headerText = <h3>{ translate( "Let's get started" ) }</h3>;
					postHeader = (
						<p className="login__header-subtitle">
							{ this.showContinueAsUser()
								? translate(
										"All Woo stores are powered by WordPress.com!{{br/}}First, select the account you'd like to use.",
										{
											components: {
												br: <br />,
											},
										}
								  )
								: translate(
										"All Woo stores are powered by WordPress.com!{{br/}}Please, log in to continue. Don't have an account? {{signupLink}}Sign up{{/signupLink}}",
										{
											components: {
												signupLink: <a href={ this.getSignupUrl() } />,
												br: <br />,
											},
										}
								  ) }
						</p>
					);
				}
			}

			if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
				headerText = translate( 'Howdy! Log in to Jetpack.com with your WordPress.com account.' );
				preHeader = (
					<div className="login__jetpack-cloud-wrapper">
						<JetpackPlusWpComLogo className="login__jetpack-plus-wpcom-logo" size={ 24 } />
					</div>
				);

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
					postHeader = (
						<p className="login__header-subtitle">
							{ translate(
								'If you prefer logging in with a password, or a social media account, choose below:'
							) }
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
								signupLink: <a href={ this.getSignupUrl() } />,
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

		if ( isWhiteLogin ) {
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

		return (
			<div className="login__form-header-wrapper">
				{ isGravPoweredLoginPage && (
					<img src={ oauth2Client.icon } width={ 27 } height={ 27 } alt={ oauth2Client.title } />
				) }
				{ preHeader }
				<div className="login__form-header">{ headerText }</div>
				{ postHeader }
			</div>
		);
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
			translate,
			isPartnerSignup,
			action,
			isWooCoreProfilerFlow,
			currentQuery,
			isGravPoweredLoginPage,
			isSignupExistingAccount,
		} = this.props;

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
					{ ! isWooCoreProfilerFlow && (
						<div className="login__lost-password-footer">
							<p className="login__lost-password-no-account">
								{ translate( 'Don’t have an account? {{signupLink}}Sign up{{/signupLink}}', {
									components: {
										signupLink: <a href={ this.getSignupUrl() } />,
									},
								} ) }
							</p>
						</div>
					) }
				</Fragment>
			);
		}

		if ( twoFactorEnabled ) {
			return (
				<Fragment>
					<AsyncLoad
						require="calypso/blocks/login/two-factor-authentication/two-factor-content"
						isBrowserSupported={ this.state.isBrowserSupported }
						isJetpack={ isJetpack }
						isWoo={ isWoo }
						isPartnerSignup={ isPartnerSignup }
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
										signupLink: <a href={ this.getSignupUrl() } />,
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
					<Fragment>
						<ContinueAsUser
							onChangeAccount={ this.handleContinueAsAnotherUser }
							isWooOAuth2Client={ isWoo }
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
							showSocialLoginFormOnly={ true }
							sendMagicLoginLink={ this.sendMagicLoginLink }
						/>
					</Fragment>
				);
			}

			// someone is already logged in, offer to proceed to the app without a new login
			return <ContinueAsUser onChangeAccount={ this.handleContinueAsAnotherUser } />;
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
				hideSignupLink={ isGravPoweredLoginPage }
				isSignupExistingAccount={ isSignupExistingAccount }
				sendMagicLoginLink={ this.sendMagicLoginLink }
				isSendingEmail={ this.props.isSendingEmail }
			/>
		);
	}

	renderFooter() {
		return ! this.showContinueAsUser() && this.props.footer;
	}

	render() {
		const { isJetpack, oauth2Client, locale } = this.props;
		return (
			<div
				className={ classNames( 'login', {
					'is-jetpack': isJetpack,
					'is-jetpack-cloud': isJetpackCloudOAuth2Client( oauth2Client ),
				} ) }
			>
				{ this.renderHeader() }

				<ErrorNotice locale={ locale } />

				{ this.renderNotice() }

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
		isJetpackWooCommerceFlow:
			'woocommerce-onboarding' === get( getCurrentQueryArguments( state ), 'from' ),
		isWooCoreProfilerFlow: isWooCommerceCoreProfilerFlow( state ),
		wccomFrom: get( getCurrentQueryArguments( state ), 'wccom-from' ),
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
		isSignupExistingAccount: !! (
			getInitialQueryArguments( state )?.is_signup_existing_account ||
			getCurrentQueryArguments( state )?.is_signup_existing_account
		),
		requestError: getRequestError( state ),
		isSendingEmail: isFetchingMagicLoginEmail( state ),
		emailRequested: isMagicLoginEmailRequested( state ),
	} ),
	{
		rebootAfterLogin,
		hideMagicLoginRequestForm,
		sendEmailLogin,
	},
	( stateProps, dispatchProps, ownProps ) => ( {
		...ownProps,
		...stateProps,
		...dispatchProps,
		sendEmailLogin: () =>
			dispatchProps.sendEmailLogin( stateProps.usernameOrEmail, {
				redirectTo: stateProps.redirectTo,
				loginFormFlow: true,
				showGlobalNotices: false,
				flow:
					( ownProps.isJetpack && 'jetpack' ) ||
					( ownProps.isGravPoweredClient && ownProps.oauth2Client.name ) ||
					null,
			} ),
	} )
)( localize( Login ) );
