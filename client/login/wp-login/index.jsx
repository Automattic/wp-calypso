/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { compact, startCase } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import config, { isEnabled } from 'config';
import DocumentHead from 'components/data/document-head';
import ExternalLink from 'components/external-link';
import Gridicon from 'gridicons';
import Main from 'components/main';
import LocaleSuggestions from 'components/locale-suggestions';
import LoginBlock from 'blocks/login';
import { recordPageView, recordTracksEvent } from 'state/analytics/actions';
import { resetMagicLoginRequestForm } from 'state/login/magic-login/actions';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import { login } from 'lib/paths';

export class Login extends React.Component {
	static propTypes = {
		locale: PropTypes.string.isRequired,
		path: PropTypes.string.isRequired,
		recordPageView: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		resetMagicLoginRequestForm: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
	};

	componentDidMount() {
		this.recordPageView( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.twoFactorAuthType !== nextProps.twoFactorAuthType ) {
			this.recordPageView( nextProps );
		}
	}

	recordPageView( props ) {
		const { twoFactorAuthType } = props;

		let url = '/log-in';
		let title = 'Login';

		if ( twoFactorAuthType ) {
			url += `/${ twoFactorAuthType }`;
			title += ` > Two-Step Authentication > ${ startCase( twoFactorAuthType ) }`;
		}

		this.props.recordPageView( url, title );
	}

	onMagicLoginRequestClick = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click' );
		this.props.resetMagicLoginRequestForm();

		page( login( { isNative: true, twoFactorAuthType: 'link' } ) );
	};

	footerLinks() {
		const { translate, twoFactorAuthType } = this.props;

		const backToWpcomLink = (
			<a href="https://wordpress.com" key="return-to-wpcom-link">
				<Gridicon icon="arrow-left" size={ 18 } /> { translate( 'Back to WordPress.com' ) }
			</a>
		);

		const magicLoginLink =
			isEnabled( 'login/magic-login' ) &&
			! twoFactorAuthType &&
			<a href="#" key="magic-login-link" onClick={ this.onMagicLoginRequestClick }>
				{ translate( 'Email me a login link' ) }
			</a>;

		const resetPasswordLink =
			! twoFactorAuthType &&
			<a href={ config( 'login_url' ) + '?action=lostpassword' } key="lost-password-link">
				{ translate( 'Lost your password?' ) }
			</a>;

		const lostPhoneLink =
			twoFactorAuthType &&
			twoFactorAuthType !== 'backup' &&
			<a href={ login( { isNative: true, twoFactorAuthType: 'backup' } ) } key="lost-phone-link">
				{ translate( "I can't access my phone" ) }
			</a>;

		const helpLink =
			twoFactorAuthType &&
			<ExternalLink
				key="help-link"
				icon={ true }
				target="_blank"
				href="http://en.support.wordpress.com/security/two-step-authentication/"
			>
				{ translate( 'Get help' ) }
			</ExternalLink>;

		return compact(
			[ lostPhoneLink, helpLink, magicLoginLink, resetPasswordLink, backToWpcomLink ],
		);
	}

	renderLocaleSuggestions() {
		const { locale, path, twoFactorAuthType } = this.props;

		if ( twoFactorAuthType ) {
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

	render() {
		const { translate, twoFactorAuthType } = this.props;

		return (
			<div>
				<Main className="wp-login__main">
					{ this.renderLocaleSuggestions() }

					<DocumentHead title={ translate( 'Log In', { textOnly: true } ) } />

					<GlobalNotices id="notices" notices={ notices.list } />

					<div>
						<div className="wp-login__container">
							<LoginBlock
								twoFactorAuthType={ twoFactorAuthType }
								title={ translate( 'Log in to your account.' ) }
							/>
						</div>

						<div className="wp-login__footer">
							{ this.footerLinks() }
						</div>
					</div>
				</Main>

				{ this.renderFooter() }
			</div>
		);
	}
}

const mapDispatch = {
	recordPageView,
	recordTracksEvent,
	resetMagicLoginRequestForm,
};

export default connect( null, mapDispatch )( localize( Login ) );
