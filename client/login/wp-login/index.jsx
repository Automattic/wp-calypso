/** @format */

/**
 * External dependencies
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { startCase } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addLocaleToWpcomUrl } from 'lib/i18n-utils';
import DocumentHead from 'components/data/document-head';
import LoginLinks from './login-links';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import Main from 'components/main';
import LocaleSuggestions from 'components/locale-suggestions';
import LoginBlock from 'blocks/login';
import { recordPageViewWithClientId as recordPageView } from 'state/analytics/actions';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import PrivateSite from './private-site';

export class Login extends React.Component {
	static propTypes = {
		clientId: PropTypes.string,
		isLoggedIn: PropTypes.bool.isRequired,
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

	static defaultProps = { isJetpack: false };

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

	renderLocaleSuggestions() {
		const { locale, path, twoFactorAuthType, socialConnect } = this.props;

		if ( twoFactorAuthType || socialConnect ) {
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
							href="https://wordpress.com/about/"
							rel="noopener noreferrer"
							target="_blank"
							title={ translate( 'About' ) }
						>
							{ translate( 'About' ) }
						</a>
						<a
							href="https://automattic.com/privacy/"
							rel="noopener noreferrer"
							target="_blank"
							title={ translate( 'Privacy' ) }
						>
							{ translate( 'Privacy' ) }
						</a>
						<a
							href="https://wordpress.com/tos/"
							rel="noopener noreferrer"
							target="_blank"
							title={ translate( 'Terms of Service' ) }
						>
							{ translate( 'Terms of Service' ) }
						</a>
					</div>
				) : (
					<img src="/calypso/images/jetpack/powered-by-jetpack.svg" alt="Powered by Jetpack" />
				) }
			</div>
		);
	}

	renderContent() {
		const {
			clientId,
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
			/>
		);
	}

	render() {
		const { locale, privateSite, socialConnect, translate, twoFactorAuthType } = this.props;
		const canonicalUrl = addLocaleToWpcomUrl( 'https://wordpress.com/login', locale );

		return (
			<div>
				<Main className="wp-login__main">
					{ this.renderLocaleSuggestions() }

					<DocumentHead
						title={ translate( 'Log In', { textOnly: true } ) }
						link={ [ { rel: 'canonical', href: canonicalUrl } ] }
					/>

					<GlobalNotices id="notices" notices={ notices.list } />

					<div>
						<div className="wp-login__container">{ this.renderContent() }</div>

						{ ! socialConnect && (
							<LoginLinks
								locale={ locale }
								twoFactorAuthType={ twoFactorAuthType }
								privateSite={ privateSite }
							/>
						) }
					</div>
				</Main>

				{ this.renderFooter() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		isLoggedIn: Boolean( getCurrentUserId( state ) ),
		locale: getCurrentLocaleSlug( state ),
		oauth2Client: getCurrentOAuth2Client( state ),
	} ),
	{
		recordPageView,
	}
)( localize( Login ) );
