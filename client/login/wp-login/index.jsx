import page from '@automattic/calypso-router';
import { Gridicon, WordPressLogo } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import LoginBlock from 'calypso/blocks/login';
import { getHeaderText } from 'calypso/blocks/login/login-header';
import AutomatticLogo from 'calypso/components/automattic-logo';
import DocumentHead from 'calypso/components/data/document-head';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import Main from 'calypso/components/main';
import WPCloudLogo from 'calypso/components/wp-cloud-logo';
import isAkismetRedirect from 'calypso/lib/akismet/is-akismet-redirect';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import {
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isCrowdsignalOAuth2Client,
	isGravatarFlowOAuth2Client,
	isGravatarOAuth2Client,
	isGravPoweredOAuth2Client,
	isBlazeProOAuth2Client,
	isWooOAuth2Client,
	isPartnerPortalOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login, lostPassword } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import {
	recordPageViewWithClientId as recordPageView,
	recordTracksEventWithClientId as recordTracksEvent,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { wasManualRenewalImmediateLoginAttempted } from 'calypso/state/immediate-login/selectors';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWCCOM from 'calypso/state/selectors/get-is-wccom';
import getIsWoo from 'calypso/state/selectors/get-is-woo';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import { withEnhancers } from 'calypso/state/utils';
import LoginFooter from './login-footer';
import LoginLinks from './login-links';

import './style.scss';

export class Login extends Component {
	static propTypes = {
		clientId: PropTypes.string,
		isLoginView: PropTypes.bool,
		isJetpack: PropTypes.bool.isRequired,
		isFromMigrationPlugin: PropTypes.bool,
		isWhiteLogin: PropTypes.bool.isRequired,
		locale: PropTypes.string.isRequired,
		oauth2Client: PropTypes.object,
		path: PropTypes.string.isRequired,
		recordPageView: PropTypes.func.isRequired,
		socialConnect: PropTypes.bool,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
		action: PropTypes.string,
		isGravPoweredClient: PropTypes.bool,
	};

	static defaultProps = { isJetpack: false, isWhiteLogin: false, isLoginView: true };

	state = {
		usernameOrEmail: '',
	};

	constructor( props ) {
		super();

		this.state.usernameOrEmail = props.emailQueryParam ?? '';
	}

	componentDidMount() {
		this.recordPageView();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.twoFactorAuthType !== prevProps.twoFactorAuthType ) {
			this.recordPageView();
		}

		if ( this.props.socialConnect !== prevProps.socialConnect ) {
			this.recordPageView();
		}
	}

	recordPageView() {
		const { socialConnect, twoFactorAuthType } = this.props;

		let url = '/log-in';
		let title = 'Login';

		if ( twoFactorAuthType ) {
			const authTypeTitle =
				twoFactorAuthType.charAt( 0 ).toUpperCase() + twoFactorAuthType.slice( 1 );
			url += `/${ twoFactorAuthType }`;
			title += ` > Two-Step Authentication > ${ authTypeTitle }`;
		}

		if ( socialConnect ) {
			url += `/${ socialConnect }`;
			title += ' > Social Connect';
		}

		this.props.recordPageView( url, title );
	}

	recordBackToWpcomLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
	};

	handleUsernameChange( usernameOrEmail ) {
		this.setState( { usernameOrEmail } );
	}

	renderI18nSuggestions() {
		const { locale, path, isLoginView } = this.props;

		if ( ! isLoginView ) {
			return null;
		}

		return <LocaleSuggestions locale={ locale } path={ path } />;
	}

	renderFooter() {
		const { isJetpack, isWhiteLogin, translate } = this.props;
		const isOauthLogin = !! this.props.oauth2Client;

		if ( isJetpack || isWhiteLogin ) {
			return null;
		}

		return (
			<div
				className={ clsx( 'wp-login__footer', {
					'wp-login__footer--oauth': isOauthLogin,
					'wp-login__footer--jetpack': ! isOauthLogin,
				} ) }
			>
				{ isCrowdsignalOAuth2Client( this.props.oauth2Client ) && (
					<LoggedOutFormBackLink
						classes={ { 'logged-out-form__link-item': false } }
						oauth2Client={ this.props.oauth2Client }
						recordClick={ this.recordBackToWpcomLinkClick }
					/>
				) }

				{ isOauthLogin ? (
					<div className="wp-login__footer-links">
						<a
							href={ localizeUrl( 'https://wordpress.com/about/' ) }
							rel="noopener noreferrer"
							target="_blank"
							title={ translate( 'About' ) }
						>
							{ translate( 'About' ) }
						</a>
						<a
							href={ localizeUrl( 'https://automattic.com/privacy/' ) }
							rel="noopener noreferrer"
							target="_blank"
							title={ translate( 'Privacy' ) }
						>
							{ translate( 'Privacy' ) }
						</a>
						<a
							href={ localizeUrl( 'https://wordpress.com/tos/' ) }
							rel="noopener noreferrer"
							target="_blank"
							title={ translate( 'Terms of Service' ) }
						>
							{ translate( 'Terms of Service' ) }
						</a>
					</div>
				) : (
					<img
						src="/calypso/images/jetpack/powered-by-jetpack.svg?v=20180619"
						alt="Powered by Jetpack"
					/>
				) }

				{ isCrowdsignalOAuth2Client( this.props.oauth2Client ) && (
					<div className="wp-login__crowdsignal-footer">
						<p className="wp-login__crowdsignal-footer-text">
							Powered by
							<Gridicon icon="my-sites" size={ 18 } />
							WordPress.com
						</p>
						<p className="wp-login__crowdsignal-footer-text">
							An
							<AutomatticLogo size={ 18 } />
							Company
						</p>
					</div>
				) }
			</div>
		);
	}

	renderGravPoweredLoginBlockFooter() {
		const { oauth2Client, translate, locale, currentQuery, currentRoute } = this.props;

		const isGravatar = isGravatarOAuth2Client( oauth2Client );
		const isFromGravatar3rdPartyApp = isGravatar && currentQuery?.gravatar_from === '3rd-party';
		const isFromGravatarQuickEditor = isGravatar && currentQuery?.gravatar_from === 'quick-editor';
		const isGravatarFlow = isGravatarFlowOAuth2Client( oauth2Client );
		const isGravatarFlowWithEmail = !! ( isGravatarFlow && currentQuery?.email_address );
		const shouldShowSignupLink =
			! isFromGravatar3rdPartyApp && ! isFromGravatarQuickEditor && ! isGravatarFlowWithEmail;
		const magicLoginUrl = login( {
			locale,
			twoFactorAuthType: 'link',
			oauth2ClientId: currentQuery?.client_id,
			redirectTo: currentQuery?.redirect_to,
			gravatarFrom: currentQuery?.gravatar_from,
			gravatarFlow: isGravatarFlow,
			emailAddress: currentQuery?.email_address,
		} );
		const currentUrl = new URL( window.location.href );
		currentUrl.searchParams.append( 'lostpassword_flow', true );
		const lostPasswordUrl = addQueryArgs(
			{
				redirect_to: currentUrl.toString(),
				client_id: currentQuery?.client_id,
			},
			lostPassword( { locale } )
		);
		const signupUrl = getSignupUrl( currentQuery, currentRoute, oauth2Client, locale );

		return (
			<>
				<hr className="grav-powered-login__divider" />
				<div className="grav-powered-login__footer">
					<a
						href={ magicLoginUrl }
						onClick={ () =>
							this.props.recordTracksEvent( 'calypso_login_magic_login_request_click' )
						}
					>
						{ isGravatar
							? translate( 'Email me a login code.' )
							: translate( 'Email me a login link.' ) }
					</a>
					<a
						href={ lostPasswordUrl }
						onClick={ () =>
							this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' )
						}
					>
						{ translate( 'Lost your password?' ) }
					</a>
					{ shouldShowSignupLink && (
						<div>
							{ translate( 'You have no account yet? {{signupLink}}Create one{{/signupLink}}.', {
								components: {
									signupLink: <a href={ signupUrl } />,
								},
							} ) }
						</div>
					) }
					<div>
						{ translate( 'Any question? {{a}}Check our help docs{{/a}}.', {
							components: {
								a: <a href="https://gravatar.com/support" target="_blank" rel="noreferrer" />,
							},
						} ) }
					</div>
				</div>
			</>
		);
	}

	recordResetPasswordLinkClick = () => {
		this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' );
	};

	getLostPasswordLink() {
		if ( this.props.twoFactorAuthType ) {
			return null;
		}

		if ( this.props.isWCCOM || this.props.isBlazePro || this.props.isWooJPC ) {
			return (
				<a
					className="login__lost-password-link"
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
					{ this.props.translate( 'Lost your password?' ) }
				</a>
			);
		}

		let lostPasswordUrl = lostPassword( { locale: this.props.locale } );

		// If we got here coming from Jetpack Cloud login page, we want to go back
		// to it after we finish the process
		if (
			isJetpackCloudOAuth2Client( this.props.oauth2Client ) ||
			isA4AOAuth2Client( this.props.oauth2Client )
		) {
			const currentUrl = new URL( window.location.href );
			currentUrl.searchParams.append( 'lostpassword_flow', true );
			const queryArgs = {
				redirect_to: currentUrl.toString(),

				// This parameter tells WPCOM that we are coming from Jetpack.com,
				// so it can present the user a Lost password page that works in
				// the context of Jetpack.com.
				client_id: this.props.oauth2Client.id,
			};
			lostPasswordUrl = addQueryArgs( queryArgs, lostPasswordUrl );
		}

		return (
			<a
				href={ lostPasswordUrl }
				key="lost-password-link"
				className="login__lost-password-link"
				onClick={ this.recordResetPasswordLinkClick }
				rel="external"
			>
				{ this.props.translate( 'Lost your password?' ) }
			</a>
		);
	}

	renderSignUpLink( signupLinkText ) {
		// Taken from client/layout/masterbar/logged-out.jsx
		const {
			currentRoute,
			locale,
			oauth2Client,
			pathname,
			currentQuery,
			translate,
			usernameOrEmail,
		} = this.props;

		if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
			return null;
		}

		if (
			( isJetpackCloudOAuth2Client( oauth2Client ) || isA4AOAuth2Client( oauth2Client ) ) &&
			'/log-in/authenticator' !== currentRoute
		) {
			return null;
		}

		// use '?signup_url' if explicitly passed as URL query param
		const signupUrl = this.props.signupUrl
			? window.location.origin + pathWithLeadingSlash( this.props.signupUrl )
			: getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname );

		return (
			<Step.LinkButton
				href={ addQueryArgs(
					{
						user_email: usernameOrEmail,
					},
					signupUrl
				) }
				key="sign-up-link"
				onClick={ this.recordSignUpLinkClick }
				rel="external"
			>
				{ signupLinkText ?? translate( 'Create a new account' ) }
			</Step.LinkButton>
		);
	}

	renderLoginHeaderNavigation() {
		return this.renderSignUpLink( this.props.translate( 'Create an account' ) );
	}

	renderLoginBlockFooter( { isGravPoweredLoginPage, isSocialFirst } ) {
		const {
			isJetpack,
			isWhiteLogin,
			isGravPoweredClient,
			socialConnect,
			twoFactorAuthType,
			locale,
			isLoginView,
			signupUrl,
			isWoo,
			isWCCOM,
			isBlazePro,
			currentQuery,
			isWooJPC,
			currentRoute,
		} = this.props;

		if ( isGravPoweredLoginPage ) {
			return this.renderGravPoweredLoginBlockFooter();
		}

		if (
			( currentQuery.lostpassword_flow === 'true' && isWooJPC ) ||
			// We don't want to show lost password option if the user is already on lost password's page
			( isSocialFirst && currentRoute === '/log-in/lostpassword' )
		) {
			return null;
		}

		if ( ( isWoo || isBlazePro ) && isLoginView ) {
			return <LoginFooter lostPasswordLink={ this.getLostPasswordLink() } shouldRenderTos />;
		}

		if ( isSocialFirst ) {
			return <LoginFooter lostPasswordLink={ this.getLostPasswordLink() } />;
		}

		const shouldRenderFooter =
			! socialConnect && ! isJetpack && ! isWCCOM && ! isBlazePro && ! isWooJPC;

		if ( shouldRenderFooter ) {
			return (
				<LoginLinks
					locale={ locale }
					twoFactorAuthType={ twoFactorAuthType }
					isWhiteLogin={ isWhiteLogin }
					isGravPoweredClient={ isGravPoweredClient }
					signupUrl={ signupUrl }
					usernameOrEmail={ this.state.usernameOrEmail }
					oauth2Client={ this.props.oauth2Client }
					getLostPasswordLink={ this.getLostPasswordLink.bind( this ) }
					renderSignUpLink={ this.renderSignUpLink.bind( this ) }
				/>
			);
		}

		return null;
	}

	renderContent( isSocialFirst ) {
		const {
			clientId,
			domain,
			isJetpack,
			isWhiteLogin,
			isGravPoweredClient,
			oauth2Client,
			socialConnect,
			twoFactorAuthType,
			socialService,
			socialServiceResponse,
			fromSite,
			locale,
			signupUrl,
			action,
			currentRoute,
		} = this.props;

		// It's used to toggle UIs for the login page of Gravatar powered clients only (excluding 2FA relevant pages).
		const isGravPoweredLoginPage =
			isGravPoweredClient &&
			! currentRoute.startsWith( '/log-in/push' ) &&
			! currentRoute.startsWith( '/log-in/authenticator' ) &&
			! currentRoute.startsWith( '/log-in/sms' ) &&
			! currentRoute.startsWith( '/log-in/webauthn' ) &&
			! currentRoute.startsWith( '/log-in/backup' );

		return (
			<LoginBlock
				action={ action }
				twoFactorAuthType={ twoFactorAuthType }
				socialConnect={ socialConnect }
				clientId={ clientId }
				isJetpack={ isJetpack }
				isWhiteLogin={ isWhiteLogin }
				isGravPoweredClient={ isGravPoweredClient }
				isGravPoweredLoginPage={ isGravPoweredLoginPage }
				oauth2Client={ oauth2Client }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
				domain={ domain }
				fromSite={ fromSite }
				footer={ this.renderLoginBlockFooter( { isGravPoweredLoginPage, isSocialFirst } ) }
				locale={ locale }
				handleUsernameChange={ this.handleUsernameChange.bind( this ) }
				signupUrl={ signupUrl }
				isSocialFirst={ isSocialFirst }
			/>
		);
	}

	render() {
		const {
			locale,
			translate,
			isFromMigrationPlugin,
			isGenericOauth,
			isGravPoweredClient,
			isWoo,
			isBlazePro,
			isWhiteLogin,
			isJetpack,
			isFromAkismet,
			twoFactorAuthType,
			isManualRenewalImmediateLoginAttempt,
			socialConnect,
			linkingSocialService,
			action,
			oauth2Client,
			isWooJPC,
			isWCCOM,
			isFromAutomatticForAgenciesPlugin,
			currentQuery,
			wccomFrom,
			twoFactorEnabled,
		} = this.props;

		const canonicalUrl = localizeUrl( 'https://wordpress.com/log-in', locale );
		const isSocialFirst = isWhiteLogin && ! isGravPoweredClient && ! isWoo && ! isBlazePro;

		const akismetLogo = (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 44 44"
				fill="none"
			>
				<rect width="44" height="44" fill="#357B49" rx="6" />
				<path
					fill="#fff"
					fillRule="evenodd"
					d="m29.746 28.31-6.392-16.797c-.152-.397-.305-.672-.789-.675-.673 0-1.408.611-1.746 1.316l-7.378 16.154c-.072.16-.143.311-.214.454-.5.995-1.045 1.546-2.357 1.626a.399.399 0 0 0-.16.033l-.01.004a.399.399 0 0 0-.23.392v.01c0 .054.01.106.03.155l.004.01a.416.416 0 0 0 .394.252h6.212a.417.417 0 0 0 .307-.12.416.416 0 0 0 .124-.305.398.398 0 0 0-.105-.302.399.399 0 0 0-.294-.127c-.757 0-2.197-.062-2.197-1.164.02-.318.103-.63.245-.916l1.399-3.152c.52-1.163 1.654-1.163 2.572-1.163h5.843c.023 0 .044 0 .062.003.13.014.16.081.214.242l1.534 4.07a2.857 2.857 0 0 1 .216 1.04c0 .054-.003.104-.01.153-.09.726-.831.887-1.49.887a.4.4 0 0 0-.294.127l-.007.008-.007.008a.401.401 0 0 0-.092.286v.01c0 .054.01.106.03.155l.005.01a.42.42 0 0 0 .395.252h7.011a.413.413 0 0 0 .279-.13.412.412 0 0 0 .11-.297.387.387 0 0 0-.09-.294.388.388 0 0 0-.277-.135c-1.448-.122-2.295-.643-2.847-2.08Zm-11.985-5.844 2.847-6.304c.361-.728.659-1.486.889-2.265 0-.06.03-.092.06-.092s.061.032.061.091c.02.122.045.247.073.374.197.888.584 1.878.914 2.723l.176.453 1.684 4.529a.927.927 0 0 1 .092.4.473.473 0 0 1-.009.094c-.041.202-.228.272-.602.272h-6.063c-.122 0-.184-.03-.184-.092a.36.36 0 0 1 .062-.183Zm17.107-.721c0 .786-.446 1.231-1.25 1.231-.806 0-1.125-.409-1.125-1.034 0-.786.465-1.231 1.25-1.231.785 0 1.125.427 1.125 1.034ZM9.629 23.002c.803 0 1.25-.447 1.25-1.231 0-.607-.343-1.036-1.128-1.036-.785 0-1.25.447-1.25 1.231 0 .625.325 1.036 1.128 1.036Z"
					clipRule="evenodd"
				/>
			</svg>
		);

		const jetpackLogo = (
			<div className="magic-login__gutenboarding-wordpress-logo">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
				>
					<path
						d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.913451 7.4078C0.00519938 9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115 23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776 18.6668C23.2962 16.6934 24 14.3734 24 12C24 8.8174 22.7357 5.76515 20.4853 3.51472C18.2348 1.26428 15.1826 0 12 0ZM11.3684 13.9895H5.40632L11.3684 2.35579V13.9895ZM12.5811 21.6189V9.98526H18.5621L12.5811 21.6189Z"
						fill="#069E08"
					/>
				</svg>
			</div>
		);

		const mainContent = (
			<Main
				className={ clsx( 'wp-login__main', {
					'is-wpcom-migration': isFromMigrationPlugin,
					'is-social-first': isSocialFirst,
					'is-generic-oauth': isGenericOauth,
					'is-jetpack': isJetpack,
				} ) }
			>
				{ this.renderI18nSuggestions() }

				<DocumentHead
					title={ translate( 'Log In' ) }
					link={ [ { rel: 'canonical', href: canonicalUrl } ] }
					meta={ [
						{
							name: 'description',
							content: translate(
								'Log in to your WordPress.com account to manage your website, publish content, and access all your tools securely and easily.'
							),
						},
					] }
				/>

				<div className="wp-login__container">{ this.renderContent( isSocialFirst ) }</div>
			</Main>
		);

		const headerText = getHeaderText(
			isSocialFirst,
			twoFactorAuthType,
			isManualRenewalImmediateLoginAttempt,
			socialConnect,
			linkingSocialService,
			action,
			oauth2Client,
			isWooJPC,
			isFromMigrationPlugin,
			isJetpack,
			isWCCOM,
			isFromAkismet,
			isFromAutomatticForAgenciesPlugin,
			isGravPoweredClient,
			wccomFrom,
			twoFactorEnabled,
			currentQuery,
			translate
		);

		let brandLogo;

		if ( isFromAkismet ) {
			brandLogo = akismetLogo;
		} else if (
			isPartnerPortalOAuth2Client( oauth2Client ) &&
			document.location.search?.includes( 'wpcloud' )
		) {
			brandLogo = <WPCloudLogo className="login__wpcloud-logo" size={ 120 } />;
		} else {
			brandLogo = (
				<WordPressLogo
					size={ 21 }
					className="step-container-v2__top-bar-wordpress-logo"
					color="currentColor"
				/>
			);
		}

		return (
			<>
				{ isWhiteLogin && (
					<Step.CenteredColumnLayout
						columnWidth={ 6 }
						topBar={
							<Step.TopBar rightElement={ this.renderLoginHeaderNavigation() } logo={ brandLogo } />
						}
						heading={ <Step.Heading text={ headerText } /> }
						verticalAlign="center"
					>
						{ mainContent }
					</Step.CenteredColumnLayout>
				) }
				{ ! isWooJPC && isJetpack && ! this.props.isFromAutomatticForAgenciesPlugin && jetpackLogo }
				{ ! isWhiteLogin && mainContent }
				{ this.renderFooter() }
			</>
		);
	}
}

export default connect(
	( state, props ) => {
		const currentQuery = getCurrentQueryArguments( state );
		const oauth2Client = getCurrentOAuth2Client( state );
		const currentRoute = getCurrentRoute( state );

		return {
			locale: getCurrentLocaleSlug( state ),
			oauth2Client,
			isLoginView:
				! props.twoFactorAuthType &&
				! props.socialConnect &&
				// React lost password screen.
				! currentRoute.includes( '/lostpassword' ) &&
				// When user clicks on the signup link, it changes the route but it doesn't immediately render the signup page
				// So we need to check if the current route is not the signup route to avoid flickering
				! currentRoute.includes( '/start' ),
			emailQueryParam:
				currentQuery.email_address || getInitialQueryArguments( state ).email_address,
			isFromAkismet: isAkismetRedirect(
				new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'back' )
			),
			isFromMigrationPlugin: startsWith( get( currentQuery, 'from' ), 'wpcom-migration' ),
			isWooJPC: isWooJPCFlow( state ),
			isWCCOM: getIsWCCOM( state ),
			isWoo: getIsWoo( state ),
			isBlazePro: getIsBlazePro( state ),
			// This applies to all oauth screens except for A4A, Blaze Pro, Jetpack, Woo.
			isGenericOauth:
				oauth2Client &&
				! isA4AOAuth2Client( oauth2Client ) &&
				! isBlazeProOAuth2Client( oauth2Client ) &&
				! isJetpackCloudOAuth2Client( oauth2Client ) &&
				! isWooOAuth2Client( oauth2Client ),
			currentRoute,
			currentQuery,
			redirectTo: getRedirectToOriginal( state ),
			isFromAutomatticForAgenciesPlugin:
				'automattic-for-agencies-client' === get( getCurrentQueryArguments( state ), 'from' ) ||
				'automattic-for-agencies-client' ===
					new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'from' ),
			isManualRenewalImmediateLoginAttempt: wasManualRenewalImmediateLoginAttempted( state ),
		};
	},
	{
		recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
		recordTracksEvent,
	}
)( localize( Login ) );
