/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { startCase } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import LoginLinks from './login-links';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getOAuth2ClientData } from 'state/login/selectors';
import Main from 'components/main';
import LocaleSuggestions from 'components/locale-suggestions';
import LoginBlock from 'blocks/login';
import { recordPageView } from 'state/analytics/actions';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import PrivateSite from './private-site';

export class Login extends React.Component {
	static propTypes = {
		clientId: PropTypes.string,
		isLoggedIn: PropTypes.bool.isRequired,
		locale: PropTypes.string.isRequired,
		oauth2ClientData: PropTypes.object,
		path: PropTypes.string.isRequired,
		privateSite: PropTypes.bool,
		recordPageView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
		socialConnect: PropTypes.bool,
	};

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
		return (
			<div className="wp-login__jetpack-footer">
				<img src="/calypso/images/jetpack/powered-by-jetpack.svg" alt="Powered by Jetpack" />
			</div>
		);
	}

	renderContent() {
		const {
			clientId,
			isLoggedIn,
			oauth2ClientData,
			privateSite,
			socialConnect,
			twoFactorAuthType,
		} = this.props;

		if ( privateSite && isLoggedIn ) {
			return (
				<PrivateSite />
			);
		}

		return (
			<LoginBlock
				twoFactorAuthType={ twoFactorAuthType }
				socialConnect={ socialConnect }
				privateSite={ privateSite }
				clientId={ clientId }
				oauth2ClientData={ oauth2ClientData }
			/>
		);
	}

	render() {
		const {
			locale,
			privateSite,
			socialConnect,
			translate,
			twoFactorAuthType,
		} = this.props;
		const canonicalUrl = `https://${ locale !== 'en' ? locale + '.' : '' }wordpress.com/login`;

		return (
			<div>
				<Main className="wp-login__main">
					{ this.renderLocaleSuggestions() }

					<DocumentHead
						title={ translate( 'Log In', { textOnly: true } ) }
						link={ [ { rel: 'canonical', href: canonicalUrl } ] } />

					<GlobalNotices id="notices" notices={ notices.list } />

					<div>
						<div className="wp-login__container">
							{ this.renderContent() }
						</div>

						{ ! socialConnect &&
							<LoginLinks locale={ locale } twoFactorAuthType={ twoFactorAuthType } privateSite={ privateSite } />
						}
					</div>
				</Main>

				{ this.renderFooter() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		isLoggedIn: Boolean( getCurrentUserId( state ) ),
		oauth2ClientData: getOAuth2ClientData( state ),
	} ),
	{
		recordPageView,
	}
)( localize( Login ) );
