import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
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
import TranslatorInvite from 'calypso/components/translator-invite';
import { getSignupUrl } from 'calypso/lib/login';
import { isCrowdsignalOAuth2Client, isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { login, lostPassword } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import {
	recordPageViewWithClientId as recordPageView,
	recordTracksEventWithClientId as recordTracksEvent,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { isPartnerSignupQuery } from 'calypso/state/login/utils';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import { withEnhancers } from 'calypso/state/utils';
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
				className={ classNames( 'wp-login__footer', {
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

		const magicLoginUrl = login( {
			locale,
			twoFactorAuthType: 'link',
			oauth2ClientId: currentQuery?.client_id,
			redirectTo: currentQuery?.redirect_to,
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
						{ translate( 'Email me a login link.' ) }
					</a>
					<a
						href={ lostPasswordUrl }
						onClick={ () =>
							this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' )
						}
					>
						{ translate( 'Lost your password?' ) }
					</a>
					<div>
						{ translate( 'You have no account yet? {{signupLink}}Create one{{/signupLink}}.', {
							components: {
								signupLink: <a href={ signupUrl } />,
							},
						} ) }
					</div>
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

	renderContent() {
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
			isLoginView,
			path,
			signupUrl,
			action,
			isWooCoreProfilerFlow,
			isPartnerSignup,
			currentRoute,
		} = this.props;

		if ( privateSite && isLoggedIn ) {
			return <PrivateSite />;
		}

		const isJetpackMagicLinkSignUpFlow =
			isJetpack && config.isEnabled( 'jetpack/magic-link-signup' );

		const shouldRenderFooter =
			! socialConnect &&
			! isJetpackMagicLinkSignUpFlow &&
			// We don't want to render the footer for woo oauth2 flows but render it if it's partner signup
			! ( isWooOAuth2Client( oauth2Client ) && ! isPartnerSignup ) &&
			! isWooCoreProfilerFlow;

		const footer = (
			<>
				{ shouldRenderFooter && (
					<LoginLinks
						locale={ locale }
						privateSite={ privateSite }
						twoFactorAuthType={ twoFactorAuthType }
						isWhiteLogin={ isWhiteLogin }
						isP2Login={ isP2Login }
						isGravPoweredClient={ isGravPoweredClient }
						signupUrl={ signupUrl }
						usernameOrEmail={ this.state.usernameOrEmail }
						oauth2ClientId={ this.props.oauth2Client?.id }
					/>
				) }
				{ isLoginView && <TranslatorInvite path={ path } /> }
			</>
		);

		// It's used to toggle UIs for the login and magic login of Gravatar powered clients only (not for F2A pages)
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
				footer={ isGravPoweredLoginPage ? this.renderGravPoweredLoginBlockFooter() : footer }
				locale={ locale }
				handleUsernameChange={ this.handleUsernameChange.bind( this ) }
				signupUrl={ signupUrl }
			/>
		);
	}

	render() {
		const { locale, translate, isFromMigrationPlugin } = this.props;
		const canonicalUrl = localizeUrl( 'https://wordpress.com/log-in', locale );
		const mainClassNames = classNames( 'wp-login__main', {
			'is-wpcom-migration': isFromMigrationPlugin,
		} );

		return (
			<div>
				{ this.props.isP2Login && this.renderP2Logo() }
				<Main className={ mainClassNames }>
					{ this.renderI18nSuggestions() }

					<DocumentHead
						title={ translate( 'Log In' ) }
						link={ [ { rel: 'canonical', href: canonicalUrl } ] }
						meta={ [ { name: 'description', content: 'Log in to WordPress.com' } ] }
					/>

					<div className="wp-login__container">{ this.renderContent() }</div>
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

		return {
			isLoggedIn: Boolean( getCurrentUserId( state ) ),
			locale: getCurrentLocaleSlug( state ),
			oauth2Client: getCurrentOAuth2Client( state ),
			isLoginView: ! props.twoFactorAuthType && ! props.socialConnect,
			emailQueryParam:
				currentQuery.email_address || getInitialQueryArguments( state ).email_address,
			isPartnerSignup: isPartnerSignupQuery( currentQuery ),
			isFromMigrationPlugin: startsWith( get( currentQuery, 'from' ), 'wpcom-migration' ),
			isWooCoreProfilerFlow: isWooCommerceCoreProfilerFlow( state ),
			currentRoute: getCurrentRoute( state ),
			currentQuery,
		};
	},
	{
		recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
		recordTracksEvent,
	}
)( localize( Login ) );
