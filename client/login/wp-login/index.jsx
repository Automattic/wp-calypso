import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import LoginBlock from 'calypso/blocks/login';
import AutomatticLogo from 'calypso/components/automattic-logo';
import DocumentHead from 'calypso/components/data/document-head';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import Main from 'calypso/components/main';
import {
	getSignupUrl,
	isReactLostPasswordScreenEnabled,
	pathWithLeadingSlash,
} from 'calypso/lib/login';
import {
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isCrowdsignalOAuth2Client,
	isWooOAuth2Client,
	isGravatarFlowOAuth2Client,
	isGravatarOAuth2Client,
	isGravPoweredOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login, lostPassword } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import {
	recordPageViewWithClientId as recordPageView,
	recordTracksEventWithClientId as recordTracksEvent,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import { isPartnerSignupQuery } from 'calypso/state/login/utils';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWooPasswordless from 'calypso/state/selectors/get-is-woo-passwordless';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import { withEnhancers } from 'calypso/state/utils';
import LoginFooter from './login-footer';
import LoginLinks from './login-links';
import PrivateSite from './private-site';

import './style.scss';

export class Login extends Component {
	static propTypes = {
		clientId: PropTypes.string,
		isLoggedIn: PropTypes.bool.isRequired,
		isLoginView: PropTypes.bool,
		isJetpack: PropTypes.bool.isRequired,
		isFromMigrationPlugin: PropTypes.bool,
		isWhiteLogin: PropTypes.bool.isRequired,
		isPartnerSignup: PropTypes.bool.isRequired,
		locale: PropTypes.string.isRequired,
		oauth2Client: PropTypes.object,
		path: PropTypes.string.isRequired,
		privateSite: PropTypes.bool,
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

	renderP2Logo() {
		return (
			<div className="wp-login__p2-logo">
				<img src="/calypso/images/p2/logo.png" width="67" height="32" alt="P2 logo" />
			</div>
		);
	}

	renderP2PoweredBy() {
		return (
			<div className="wp-login__p2-powered-by">
				<img
					src="/calypso/images/p2/w-logo.png"
					className="wp-login__p2-powered-by-logo"
					alt="WP.com logo"
				/>
				<span className="wp-login__p2-powered-by-text">
					{ this.props.translate( 'Powered by WordPress.com' ) }
				</span>
			</div>
		);
	}

	renderI18nSuggestions() {
		const { locale, path, isLoginView } = this.props;

		if ( ! isLoginView ) {
			return null;
		}

		return <LocaleSuggestions locale={ locale } path={ path } />;
	}

	renderFooter() {
		const { isJetpack, isWhiteLogin, isP2Login, translate } = this.props;
		const isOauthLogin = !! this.props.oauth2Client;

		if ( isJetpack || isWhiteLogin || isP2Login ) {
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
		const magicLoginUrl = login( {
			locale,
			twoFactorAuthType: 'link',
			oauth2ClientId: currentQuery?.client_id,
			redirectTo: currentQuery?.redirect_to,
			gravatarFrom: currentQuery?.gravatar_from,
			gravatarFlow: isGravatarFlowOAuth2Client( oauth2Client ),
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
					{ ! isFromGravatar3rdPartyApp && (
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
		if ( this.props.twoFactorAuthType || this.props.privateSite ) {
			return null;
		}

		if ( isReactLostPasswordScreenEnabled() && ( this.props.isWoo || this.props.isBlazePro ) ) {
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
								action: this.props.isWooCoreProfilerFlow ? 'jetpack/lostpassword' : 'lostpassword',
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
			isP2Login,
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

		if ( isP2Login && currentQuery?.redirect_to ) {
			const urlParts = getUrlParts( currentQuery.redirect_to );
			if ( urlParts.pathname.startsWith( '/accept-invite/' ) ) {
				return null;
			}
		}

		// use '?signup_url' if explicitly passed as URL query param
		const signupUrl = this.props.signupUrl
			? window.location.origin + pathWithLeadingSlash( this.props.signupUrl )
			: getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname );

		return (
			<a
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
			</a>
		);
	}

	renderLoginHeaderNavigation() {
		return (
			<div className="wp-login__header-navigation">
				{ this.renderSignUpLink( this.props.translate( 'Create an account' ) ) }
			</div>
		);
	}

	renderLoginBlockFooter( { isGravPoweredLoginPage, isSocialFirst } ) {
		const {
			isJetpack,
			isWhiteLogin,
			isP2Login,
			isGravPoweredClient,
			privateSite,
			socialConnect,
			twoFactorAuthType,
			locale,
			isLoginView,
			signupUrl,
			isWooCoreProfilerFlow,
			isWooPasswordless,
			isPartnerSignup,
			isWoo,
			isBlazePro,
		} = this.props;

		if ( isGravPoweredLoginPage ) {
			return this.renderGravPoweredLoginBlockFooter();
		}

		if ( ( isWooPasswordless || isBlazePro ) && isLoginView ) {
			return (
				<>
					<LoginFooter lostPasswordLink={ this.getLostPasswordLink() } shouldRenderTos />
				</>
			);
		}

		if ( isSocialFirst ) {
			return (
				<>
					<LoginFooter lostPasswordLink={ this.getLostPasswordLink() } />
				</>
			);
		}

		const isJetpackMagicLinkSignUpFlow =
			isJetpack && config.isEnabled( 'jetpack/magic-link-signup' );

		const shouldRenderFooter =
			! socialConnect &&
			! isJetpackMagicLinkSignUpFlow &&
			// We don't want to render the footer for woo oauth2 flows but render it if it's partner signup
			! ( isWoo && ! isPartnerSignup ) &&
			! isBlazePro &&
			! isWooCoreProfilerFlow;

		if ( shouldRenderFooter ) {
			return (
				<>
					<LoginLinks
						locale={ locale }
						privateSite={ privateSite }
						twoFactorAuthType={ twoFactorAuthType }
						isWhiteLogin={ isWhiteLogin }
						isP2Login={ isP2Login }
						isGravPoweredClient={ isGravPoweredClient }
						signupUrl={ signupUrl }
						usernameOrEmail={ this.state.usernameOrEmail }
						oauth2Client={ this.props.oauth2Client }
						getLostPasswordLink={ this.getLostPasswordLink.bind( this ) }
						renderSignUpLink={ this.renderSignUpLink.bind( this ) }
					/>
				</>
			);
		}

		return null;
	}

	renderContent( isSocialFirst ) {
		const {
			clientId,
			domain,
			isLoggedIn,
			isJetpack,
			isWhiteLogin,
			isP2Login,
			isGravPoweredClient,
			oauth2Client,
			privateSite,
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

		if ( privateSite && isLoggedIn ) {
			return <PrivateSite />;
		}

		// It's used to toggle UIs for the login page of Gravatar powered clients only (not for F2A pages).
		const isGravPoweredLoginPage = isGravPoweredClient && currentRoute === '/log-in';

		return (
			<LoginBlock
				action={ action }
				twoFactorAuthType={ twoFactorAuthType }
				socialConnect={ socialConnect }
				privateSite={ privateSite }
				clientId={ clientId }
				isJetpack={ isJetpack }
				isWhiteLogin={ isWhiteLogin }
				isP2Login={ isP2Login }
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
			isGravPoweredClient,
			isWoo,
			isBlazePro,
			isWhiteLogin,
		} = this.props;
		const canonicalUrl = localizeUrl( 'https://wordpress.com/log-in', locale );
		const isSocialFirst =
			config.isEnabled( 'login/social-first' ) &&
			isWhiteLogin &&
			! isGravPoweredClient &&
			! isWoo &&
			! isBlazePro;

		return (
			<div>
				{ this.props.isP2Login && this.renderP2Logo() }
				<Main
					className={ clsx( 'wp-login__main', {
						'is-wpcom-migration': isFromMigrationPlugin,
						'is-social-first': isSocialFirst,
					} ) }
				>
					{ this.renderI18nSuggestions() }

					<DocumentHead
						title={ translate( 'Log In' ) }
						link={ [ { rel: 'canonical', href: canonicalUrl } ] }
						meta={ [ { name: 'description', content: 'Log in to WordPress.com' } ] }
					/>

					{ isSocialFirst && this.renderLoginHeaderNavigation() }
					<div className="wp-login__container">{ this.renderContent( isSocialFirst ) }</div>
				</Main>

				{ this.renderFooter() }
				{ this.props.isP2Login && this.renderP2PoweredBy() }
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const currentQuery = getCurrentQueryArguments( state );
		const oauth2Client = getCurrentOAuth2Client( state );
		const currentRoute = getCurrentRoute( state );

		return {
			isLoggedIn: Boolean( getCurrentUserId( state ) ),
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
			isPartnerSignup: isPartnerSignupQuery( currentQuery ),
			isFromMigrationPlugin: startsWith( get( currentQuery, 'from' ), 'wpcom-migration' ),
			isWooCoreProfilerFlow: isWooCommerceCoreProfilerFlow( state ),
			isWoo: isWooOAuth2Client( oauth2Client ),
			isWooPasswordless: getIsWooPasswordless( state ),
			isBlazePro: getIsBlazePro( state ),
			currentRoute,
			currentQuery,
			redirectTo: getRedirectToOriginal( state ),
		};
	},
	{
		recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
		recordTracksEvent,
	}
)( localize( Login ) );
