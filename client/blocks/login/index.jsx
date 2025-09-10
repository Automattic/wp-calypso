import page from '@automattic/calypso-router';
import clsx from 'clsx';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import Notice from 'calypso/components/notice';
import isAkismetRedirect from 'calypso/lib/akismet/is-akismet-redirect';
import getGravatarOAuth2Flow from 'calypso/lib/get-gravatar-oauth2-flow';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import {
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isBlazeProOAuth2Client,
	isGravatarFlowOAuth2Client,
	isGravatarOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import { isWebAuthnSupported } from 'calypso/lib/webauthn';
import GravPoweredLoginBlockHeader from 'calypso/login/wp-login/gravatar/grav-powered-login-block-header';
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
import { isPasswordlessAccount } from 'calypso/state/login/utils';
import { logoutUser } from 'calypso/state/logout/actions';
import { errorNotice as errorNoticeAction } from 'calypso/state/notices/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsWCCOM from 'calypso/state/selectors/get-is-wccom';
import getIsWoo from 'calypso/state/selectors/get-is-woo';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
import isFetchingMagicLoginEmail from 'calypso/state/selectors/is-fetching-magic-login-email';
import isMagicLoginEmailRequested from 'calypso/state/selectors/is-magic-login-email-requested';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import ContinueAsUser from './continue-as-user';
import ErrorNotice from './error-notice';
import LoginForm from './login-form';
import { shouldUseMagicCode } from './utils/should-use-magic-code';

import './style.scss';

class Login extends Component {
	static propTypes = {
		disableAutoFocus: PropTypes.bool,
		isLinking: PropTypes.bool,
		isJetpack: PropTypes.bool.isRequired,
		isFromAkismet: PropTypes.bool,
		isFromAutomatticForAgenciesPlugin: PropTypes.bool,
		isManualRenewalImmediateLoginAttempt: PropTypes.bool,
		linkingSocialService: PropTypes.string,
		oauth2Client: PropTypes.object,
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
		loginEmailAddress: PropTypes.string,
		action: PropTypes.string,
		isGravPoweredClient: PropTypes.bool,
		isGravPoweredLoginPage: PropTypes.bool,
		isSignupExistingAccount: PropTypes.bool,
		emailRequested: PropTypes.bool,
		isSendingEmail: PropTypes.bool,
		isWooJPC: PropTypes.bool,
		isWCCOM: PropTypes.bool,
		isWoo: PropTypes.bool,
		from: PropTypes.string,
	};

	state = {
		isBrowserSupported: isWebAuthnSupported(),
	};

	static defaultProps = {
		isJetpack: false,
	};

	componentDidMount() {
		if ( ! this.props.twoFactorEnabled && this.props.twoFactorAuthType ) {
			// Disallow access to the 2FA pages unless the user has 2FA enabled
			page(
				login( {
					isJetpack: this.props.isJetpack,
					locale: this.props.locale,
					currentQuery: this.props.currentQuery,
				} )
			);
		}

		if ( this.props.currentQuery?.error === 'google_one_tap_auth' ) {
			this.props.showErrorNotice(
				this.props.translate(
					'Something went wrong when trying to connect with Google. Please use any of the login options below.'
				)
			);
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
			this.props.isWooJPC &&
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

		const usernameOnlyRequired = this.props.currentQuery?.username_only === 'true';
		if (
			this.props.requestError?.field === 'usernameOrEmail' &&
			this.props.requestError?.code === 'email_login_not_allowed' &&
			! usernameOnlyRequired
		) {
			let urlConfig = {
				locale: this.props.locale,
				twoFactorAuthType: 'link',
				oauth2ClientId: this.props.currentQuery?.client_id,
				redirectTo: this.props.redirectTo,
				usernameOnly: true,
			};

			if ( this.props.isGravPoweredClient ) {
				urlConfig = {
					...urlConfig,
					gravatarFrom:
						isGravatarOAuth2Client( this.props.oauth2Client ) &&
						this.props.currentQuery?.gravatar_from,
					gravatarFlow: isGravatarFlowOAuth2Client( this.props.oauth2Client ),
					emailAddress: this.props.currentQuery?.email_address,
				};
			}

			const magicLoginUrl = login( urlConfig );

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
			oauth2Client,
			socialConnect,
			twoStepNonce,
			fromSite,
			currentUser,
			twoFactorEnabled,
			loginEmailAddress,
			isWCCOM,
			isBlazePro,
		} = this.props;

		return (
			! twoStepNonce &&
			! socialConnect &&
			// Show the continue as user flow WooCommerce and Blaze Pro but not for other OAuth2 clients
			! ( oauth2Client && ! isWCCOM && ! isBlazePro ) &&
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
		} else if ( this.props.isWCCOM || this.props.isGravPoweredClient ) {
			page(
				login( {
					isJetpack: this.props.isJetpack,
					// If no notification is sent, the user is using the authenticator for 2FA by default
					twoFactorAuthType: authType,
					locale: this.props.locale,
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
					from: this.props.currentQuery?.from,
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

					event.preventDefault();
					window.location.href = signupUrl;
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
			isWCCOM,
			isWooJPC,
		} = this.props;

		if ( signupUrl ) {
			return window.location.origin + pathWithLeadingSlash( signupUrl );
		}

		if ( isWCCOM && isEmpty( currentQuery ) ) {
			// if query is empty, return to the woo start flow
			return 'https://woocommerce.com/start/';
		}

		if ( isWooJPC && isEmpty( currentQuery ) ) {
			return getSignupUrl( initialQuery, currentRoute, oauth2Client, locale, pathname );
		}

		return getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname );
	};

	renderLoginFormSignupNotice() {
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
			isWCCOM,
			isBlazePro,
			translate,
			action,
			currentQuery,
			isGravPoweredClient,
			isSocialFirst,
			isFromAutomatticForAgenciesPlugin,
			currentUser,
			redirectTo,
			isWooJPC,
			isWoo,
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

		if ( action === 'lostpassword' ) {
			return (
				<Fragment>
					<div className="login__lost-password-form-wrapper">
						<AsyncLoad
							require="calypso/blocks/login/lost-password-form"
							redirectToAfterLoginUrl={ this.props.redirectTo }
							oauth2ClientId={ this.props.oauth2Client && this.props.oauth2Client.id }
							locale={ locale }
							isWoo={ isWoo }
							isWooJPC={ isWooJPC }
							from={ get( currentQuery, 'from' ) }
							isJetpack={ isJetpack }
						/>
					</div>
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
						isBlazePro={ isBlazePro }
						isGravPoweredClient={ isGravPoweredClient }
						twoFactorAuthType={ twoFactorAuthType }
						twoFactorNotificationSent={ twoFactorNotificationSent }
						handleValid2FACode={ this.handleValid2FACode }
						rebootAfterLogin={ this.rebootAfterLogin }
						switchTwoFactorAuthType={ this.handleTwoFactorRequested }
					/>
					{ isWoo && (
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
			if ( isWCCOM || isBlazePro ) {
				return (
					<div className="login__body login__body--continue-as-user">
						<ContinueAsUser
							currentUser={ currentUser }
							onChangeAccount={ this.handleContinueAsAnotherUser }
							redirectPath={ redirectTo }
							isBlazePro={ isBlazePro }
							isWoo={ isWCCOM }
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
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
				domain={ domain }
				locale={ locale }
				userEmail={ userEmail }
				handleUsernameChange={ handleUsernameChange }
				signupUrl={ signupUrl }
				sendMagicLoginLink={ this.sendMagicLoginLink }
				isFromAkismet={ this.props.isFromAkismet }
				isSendingEmail={ this.props.isSendingEmail }
				isSocialFirst={ isSocialFirst } // TODO just not gravatar
				isJetpack={ isJetpack }
				isFromAutomatticForAgenciesPlugin={ isFromAutomatticForAgenciesPlugin }
				loginButtonText={
					isWooJPC && this.props.initialQuery?.lostpassword_flow === 'true'
						? translate( 'Log in' )
						: null
				}
			/>
		);
	}

	renderFooter() {
		return ! this.showContinueAsUser() && this.props.footer;
	}

	render() {
		const {
			isFromAkismet,
			isJetpack,
			oauth2Client,
			locale,
			isWCCOM,
			isFromAutomatticForAgenciesPlugin,
			action,
			fromSite,
			isGravPoweredClient,
			isGravPoweredLoginPage,
			isManualRenewalImmediateLoginAttempt,
			isSignupExistingAccount,
			linkingSocialService,
			socialConnect,
			twoStepNonce,
			twoFactorAuthType,
		} = this.props;

		return (
			<div
				className={ clsx( 'login', {
					'is-akismet': isFromAkismet,
					'is-jetpack': isJetpack,
					// TODO: Confirm if `is-jetpack-cloud` is needed
					'is-jetpack-cloud': isJetpackCloudOAuth2Client( oauth2Client ),
					'is-automattic-for-agencies-flow': isFromAutomatticForAgenciesPlugin,
					// TODO: Confirm if `is-a4a` is needed
					'is-a4a': isA4AOAuth2Client( oauth2Client ),
				} ) }
			>
				{ isGravPoweredClient && (
					<GravPoweredLoginBlockHeader
						action={ action }
						fromSite={ fromSite }
						isGravPoweredLoginPage={ isGravPoweredLoginPage }
						isManualRenewalImmediateLoginAttempt={ isManualRenewalImmediateLoginAttempt }
						linkingSocialService={ linkingSocialService }
						socialConnect={ socialConnect }
						twoStepNonce={ twoStepNonce }
						twoFactorAuthType={ twoFactorAuthType }
					/>
				) }

				{ isSignupExistingAccount && this.renderLoginFormSignupNotice() }

				{ /* For Woo, we render the ErrrorNotice component in login-form.jsx */ }
				{ ! isWCCOM && <ErrorNotice locale={ locale } /> }

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
		isFromAkismet: isAkismetRedirect(
			new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'back' )
		),
		isFromAutomatticForAgenciesPlugin:
			'automattic-for-agencies-client' === get( getCurrentQueryArguments( state ), 'from' ) ||
			'automattic-for-agencies-client' ===
				new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'from' ),
		isWooJPC: isWooJPCFlow( state ),
		isWCCOM: getIsWCCOM( state ),
		isWoo: getIsWoo( state ),
		wccomFrom: getWccomFrom( state ),
		currentQuery: getCurrentQueryArguments( state ),
		initialQuery: getInitialQueryArguments( state ),
		currentRoute: getCurrentRoute( state ),
		loginEmailAddress: getCurrentQueryArguments( state )?.email_address,
		isBlazePro: isBlazeProOAuth2Client( getCurrentOAuth2Client( state ) ),
		isSignupExistingAccount: !! (
			getInitialQueryArguments( state )?.is_signup_existing_account ||
			getCurrentQueryArguments( state )?.is_signup_existing_account
		),
		requestError: getRequestError( state ),
		isSendingEmail: isFetchingMagicLoginEmail( state ),
		emailRequested: isMagicLoginEmailRequested( state ),
		isLoggedIn: isUserLoggedIn( state ),
		from: get( getCurrentQueryArguments( state ), 'from' ),
	} ),
	{
		rebootAfterLogin,
		hideMagicLoginRequestForm,
		sendEmailLogin,
		logoutUser,
		redirectToLogout,
		errorNoticeAction,
	},
	( stateProps, dispatchProps, ownProps ) => ( {
		...ownProps,
		...stateProps,
		...dispatchProps,
		showErrorNotice: ( text, noticeOptions ) =>
			dispatchProps.errorNoticeAction( text, noticeOptions ),
		sendEmailLogin: ( options = {} ) => {
			return dispatchProps.sendEmailLogin( stateProps.usernameOrEmail, {
				redirectTo: stateProps.redirectTo,
				loginFormFlow: true,
				showGlobalNotices: false,
				...( shouldUseMagicCode( { isJetpack: ownProps.isJetpack } ) && { tokenType: 'code' } ),
				source: stateProps.isWooJPC ? 'woo-passwordless-jpc' + '-' + get( stateProps, 'from' ) : '',
				flow:
					( ownProps.isJetpack && 'jetpack' ) ||
					( ownProps.isGravPoweredClient && getGravatarOAuth2Flow( ownProps.oauth2Client ) ) ||
					null,
				...options,
			} );
		},
	} )
)( localize( Login ) );
