/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { startCase } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import LocaleSuggestions from 'components/locale-suggestions';
import TranslatorInvite from 'components/translator-invite';
import LoginBlock from 'blocks/login';
import LoginLinks from './login-links';
import Main from 'components/main';
import PrivateSite from './private-site';
import { localizeUrl } from 'lib/i18n-utils';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import {
	recordPageViewWithClientId as recordPageView,
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

	static defaultProps = { isJetpack: false, isLoginView: true };

	componentDidMount() {
		this.recordPageView( this.props );
	}

	componentWillReceiveProps( nextProps ) {
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

	renderI18nSuggestions() {
		const { locale, path, isLoginView } = this.props;

		if ( ! isLoginView ) {
			return null;
		}

		return <LocaleSuggestions locale={ locale } path={ path } />;
	}

	renderFooter() {
		const { translate } = this.props;
		const isOauthLogin = !! this.props.oauth2Client;
		return (
			<div
				className={ classNames( 'wp-login__footer', {
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

	renderContent() {
		const {
			clientId,
			domain,
			isLoggedIn,
			isJetpack,
			oauth2Client,
			privateSite,
			socialConnect,
			twoFactorAuthType,
			socialService,
			socialServiceResponse,
		} = this.props;

		if ( privateSite && isLoggedIn ) {
			return <PrivateSite />;
		}

		return (
			<LoginBlock
				twoFactorAuthType={ twoFactorAuthType }
				socialConnect={ socialConnect }
				privateSite={ privateSite }
				clientId={ clientId }
				isJetpack={ isJetpack }
				oauth2Client={ oauth2Client }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
				domain={ domain }
			/>
		);
	}

	render() {
		const {
			isLoginView,
			locale,
			path,
			privateSite,
			socialConnect,
			translate,
			twoFactorAuthType,
		} = this.props;
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

					<div>
						<div className="wp-login__container">{ this.renderContent() }</div>

						{ ! socialConnect && (
							<LoginLinks
								locale={ locale }
								privateSite={ privateSite }
								twoFactorAuthType={ twoFactorAuthType }
							/>
						) }
						{ isLoginView && <TranslatorInvite path={ path } /> }
					</div>
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
	}
)( localize( Login ) );
