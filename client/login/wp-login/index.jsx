/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { startCase } from 'lodash';

/**
 * Internal dependencies
 */
import AutomatticLogo from 'components/automattic-logo';
import DocumentHead from 'components/data/document-head';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import LocaleSuggestions from 'components/locale-suggestions';
import LoggedOutFormBackLink from 'components/logged-out-form/back-link';
import TranslatorInvite from 'components/translator-invite';
import LoginBlock from 'blocks/login';
import { isCrowdsignalOAuth2Client } from 'lib/oauth2-clients';
import LoginLinks from './login-links';
import Main from 'components/main';
import PrivateSite from './private-site';
import { localizeUrl } from 'lib/i18n-utils';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import {
	recordPageViewWithClientId as recordPageView,
	recordTracksEventWithClientId as recordTracksEvent,
	enhanceWithSiteType,
} from 'state/analytics/actions';
import { withEnhancers } from 'state/utils';

/**
 * Style dependencies
 */
import './style.scss';

export class Login extends React.Component {
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

	componentDidMount() {
		this.recordPageView( this.props );
	}

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
			url += `/${ twoFactorAuthType }`;
			title += ` > Two-Step Authentication > ${ startCase( twoFactorAuthType ) }`;
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

	renderI18nSuggestions() {
		const { locale, path, isLoginView } = this.props;

		if ( ! isLoginView ) {
			return null;
		}

		return <LocaleSuggestions locale={ locale } path={ path } />;
	}

	renderFooter() {
		const { isJetpack, isGutenboarding, translate } = this.props;
		const isOauthLogin = !! this.props.oauth2Client;

		if ( isJetpack || isGutenboarding ) {
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

		const footer = (
			<>
				{ ! socialConnect && (
					<LoginLinks
						locale={ locale }
						privateSite={ privateSite }
						twoFactorAuthType={ twoFactorAuthType }
						isGutenboarding={ isGutenboarding }
						signupUrl={ signupUrl }
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
				oauth2Client={ oauth2Client }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
				domain={ domain }
				fromSite={ fromSite }
				footer={ footer }
				locale={ locale }
			/>
		);
	}

	render() {
		const { locale, translate } = this.props;
		const canonicalUrl = localizeUrl( 'https://wordpress.com/log-in', locale );
		return (
			<div>
				<Main className="wp-login__main">
					{ this.renderI18nSuggestions() }

					<DocumentHead
						title={ translate( 'Log In' ) }
						link={ [ { rel: 'canonical', href: canonicalUrl } ] }
						meta={ [ { name: 'description', content: 'Log in to WordPress.com' } ] }
					/>

					<div className="wp-login__container">{ this.renderContent() }</div>
				</Main>

				{ this.renderFooter() }
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
	} ),
	{
		recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
		recordTracksEvent,
	}
)( localize( Login ) );
