import page from '@automattic/calypso-router';
import { WordPressLogo } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import LoginBlock from 'calypso/blocks/login';
import { getHeaderText } from 'calypso/blocks/login/login-header';
import DocumentHead from 'calypso/components/data/document-head';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import Main from 'calypso/components/main';
import WPCloudLogo from 'calypso/components/wp-cloud-logo';
import isAkismetRedirect from 'calypso/lib/akismet/is-akismet-redirect';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import {
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isGravPoweredOAuth2Client,
	isBlazeProOAuth2Client,
	isWooOAuth2Client,
	isPartnerPortalOAuth2Client,
	isStudioAppOAuth2Client,
	isCrowdsignalOAuth2Client,
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
import HeadingLogo from './components/heading-logo';
import HeadingSubText from './components/heading-subtext';
import LoginFooter from './login-footer';
import LoginLinks from './login-links';

import './style.scss';

export class Login extends Component {
	static propTypes = {
		clientId: PropTypes.string,
		isLoginView: PropTypes.bool,
		isJetpack: PropTypes.bool.isRequired,
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
			</div>
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

	renderLoginBlockFooter( { isSocialFirst } ) {
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

		if (
			( currentQuery.lostpassword_flow === 'true' && isWooJPC ) ||
			// We don't want to show lost password option if the user is already on lost password's page
			( isSocialFirst && currentRoute === '/log-in/lostpassword' )
		) {
			return null;
		}

		if ( isWoo && isLoginView ) {
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
				footer={ this.renderLoginBlockFooter( { isSocialFirst } ) }
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
		const isSocialFirst = isWhiteLogin && ! isWoo;

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

		if (
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

		const shouldUseWideHeading =
			isStudioAppOAuth2Client( oauth2Client ) ||
			isFromAkismet ||
			isCrowdsignalOAuth2Client( oauth2Client ) ||
			isGravPoweredClient ||
			isBlazePro;

		return (
			<>
				{ isWhiteLogin && (
					<Step.CenteredColumnLayout
						columnWidth={ 6 }
						{ ...( shouldUseWideHeading && { columnWidthHeading: 8 } ) }
						topBar={
							<Step.TopBar rightElement={ this.renderLoginHeaderNavigation() } logo={ brandLogo } />
						}
						heading={
							<Step.Heading
								text={
									<>
										<HeadingLogo isFromAkismet={ isFromAkismet } />
										<div className="wp-login__heading-text">{ headerText }</div>
									</>
								}
								subText={
									<HeadingSubText
										isSocialFirst={ isSocialFirst }
										twoFactorAuthType={ twoFactorAuthType }
									/>
								}
							/>
						}
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
				! isWooOAuth2Client( oauth2Client ) &&
				! isCrowdsignalOAuth2Client( oauth2Client ) &&
				! isStudioAppOAuth2Client( oauth2Client ) &&
				! isGravPoweredOAuth2Client( oauth2Client ),
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
