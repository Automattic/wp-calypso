import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
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
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { isCrowdsignalOAuth2Client } from 'calypso/lib/oauth2-clients';
import {
	recordPageViewWithClientId as recordPageView,
	recordTracksEventWithClientId as recordTracksEvent,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
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
		isGutenboarding: PropTypes.bool.isRequired,
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
	};

	static defaultProps = { isJetpack: false, isGutenboarding: false, isLoginView: true };

	state = {
		usernameOrEmail: '',
	};

	constructor( props ) {
		super();

		this.state.usernameOrEmail = props.emailQueryParam ?? '';
	}

	componentDidMount() {
		this.recordPageView( this.props );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.twoFactorAuthType !== nextProps.twoFactorAuthType ) {
			this.recordPageView( nextProps );
		}

		if ( this.props.socialConnect !== nextProps.socialConnect ) {
			this.recordPageView( nextProps );
		}
	}

	recordPageView( props ) {
		const { socialConnect, twoFactorAuthType } = props;

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

	renderFooter() {
		const { isJetpack, isGutenboarding, isP2Login, translate } = this.props;
		const isOauthLogin = !! this.props.oauth2Client;

		if ( isJetpack || isGutenboarding || isP2Login ) {
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

	renderContent() {
		const {
			clientId,
			domain,
			isLoggedIn,
			isJetpack,
			isGutenboarding,
			isP2Login,
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
		} = this.props;

		if ( privateSite && isLoggedIn ) {
			return <PrivateSite />;
		}

		const isJetpackMagicLinkSignUpFlow =
			isJetpack && config.isEnabled( 'jetpack/magic-link-signup' );

		const shouldRenderFooter = ! socialConnect && ! isJetpackMagicLinkSignUpFlow;

		const footer = (
			<>
				{ shouldRenderFooter && (
					<LoginLinks
						locale={ locale }
						privateSite={ privateSite }
						twoFactorAuthType={ twoFactorAuthType }
						isGutenboarding={ isGutenboarding }
						isP2Login={ isP2Login }
						signupUrl={ signupUrl }
						usernameOrEmail={ this.state.usernameOrEmail }
					/>
				) }
				{ isLoginView && <TranslatorInvite path={ path } /> }
			</>
		);

		return (
			<LoginBlock
				twoFactorAuthType={ twoFactorAuthType }
				socialConnect={ socialConnect }
				privateSite={ privateSite }
				clientId={ clientId }
				isJetpack={ isJetpack }
				isGutenboarding={ isGutenboarding }
				isP2Login={ isP2Login }
				oauth2Client={ oauth2Client }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
				domain={ domain }
				fromSite={ fromSite }
				footer={ footer }
				locale={ locale }
				handleUsernameChange={ this.handleUsernameChange.bind( this ) }
				signupUrl={ signupUrl }
			/>
		);
	}

	render() {
		const { locale, translate, isLoginView, path } = this.props;
		const canonicalUrl = localizeUrl( 'https://wordpress.com/log-in', locale );
		return (
			<div>
				{ this.props.isP2Login && this.renderP2Logo() }
				<Main className="wp-login__main">
					<DocumentHead
						title={ translate( 'Log In' ) }
						link={ [ { rel: 'canonical', href: canonicalUrl } ] }
						meta={ [ { name: 'description', content: 'Log in to WordPress.com' } ] }
					/>
					{ isLoginView && <LocaleSuggestions path={ path } /> }
					<div className="wp-login__container">{ this.renderContent() }</div>
				</Main>

				{ this.renderFooter() }
				{ this.props.isP2Login && this.renderP2PoweredBy() }
			</div>
		);
	}
}

export default connect(
	( state, props ) => ( {
		isLoggedIn: Boolean( getCurrentUserId( state ) ),
		locale: getCurrentLocaleSlug( state ),
		oauth2Client: getCurrentOAuth2Client( state ),
		isLoginView: ! props.twoFactorAuthType && ! props.socialConnect,
		emailQueryParam:
			getCurrentQueryArguments( state ).email_address ||
			getInitialQueryArguments( state ).email_address,
	} ),
	{
		recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
		recordTracksEvent,
	}
)( localize( Login ) );
