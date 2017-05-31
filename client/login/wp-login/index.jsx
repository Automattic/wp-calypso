/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { compact } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	CHECK_YOUR_EMAIL_PAGE,
	INTERSTITIAL_PAGE,
	LINK_EXPIRED_PAGE,
	REQUEST_FORM,
} from 'state/login/magic-login/constants';
import config, { isEnabled } from 'config';
import EmailedLoginLinkSuccessfully from '../magic-login/emailed-login-link-successfully';
import EmailedLoginLinkExpired from '../magic-login/emailed-login-link-expired';
import ExternalLink from 'components/external-link';
import {
	getMagicLoginEmailAddressFormInput,
	getMagicLoginCurrentView,
} from 'state/selectors';
import { getCurrentQueryArguments } from 'state/ui/selectors';
import Gridicon from 'gridicons';
import HandleEmailedLinkForm from '../magic-login/handle-emailed-link-form';
import {
	hideMagicLoginRequestForm,
	showMagicLoginInterstitialPage,
	showMagicLoginRequestForm,
} from 'state/login/magic-login/actions';
import Main from 'components/main';
import LoginBlock from 'blocks/login';
import RequestLoginEmailForm from '../magic-login/request-login-email-form';
import { recordTracksEvent } from 'state/analytics/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import { login } from 'lib/paths';

export class Login extends React.Component {
	static propTypes = {
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		magicLoginEmailAddress: PropTypes.string,
		magicLoginEnabled: PropTypes.bool,
		magicLoginView: PropTypes.string,
		recordTracksEvent: PropTypes.func.isRequired,
		showMagicLoginInterstitialPage: PropTypes.func.isRequired,
		showMagicLoginRequestForm: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
	};

	onClickEnterPasswordInstead = event => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_enter_password_instead_click' );
		this.props.hideMagicLoginRequestForm();
	};

	onMagicLoginRequestClick = event => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click' );
		this.props.showMagicLoginRequestForm();
	};

	magicLoginMainContent() {
		const {
			magicLoginView,
			magicLoginEmailAddress,
		} = this.props;

		switch ( magicLoginView ) {
			case LINK_EXPIRED_PAGE:
				this.props.recordTracksEvent( 'calypso_login_magic_link_expired_link_view' );
				return <EmailedLoginLinkExpired />;
			case CHECK_YOUR_EMAIL_PAGE:
				this.props.recordTracksEvent( 'calypso_login_magic_link_link_sent_view' );
				return <EmailedLoginLinkSuccessfully emailAddress={ magicLoginEmailAddress } />;
			case INTERSTITIAL_PAGE:
				this.props.recordTracksEvent( 'calypso_login_magic_link_interstitial_view' );
				return <HandleEmailedLinkForm />;
		}
	}

	componentWillMount() {
		const {
			magicLoginEnabled,
			queryArguments,
		} = this.props;

		if ( magicLoginEnabled && queryArguments && queryArguments.action === 'handleLoginEmail' ) {
			this.props.showMagicLoginInterstitialPage();
		}
	}

	goBack = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_go_back_click' );

		if ( typeof window !== 'undefined' ) {
			window.history.back();
		}
	};

	footerLinks() {
		const {
			magicLoginEnabled,
			magicLoginView,
			translate,
			twoFactorAuthType
		} = this.props;

		if ( magicLoginEnabled && magicLoginView === REQUEST_FORM ) {
			return <a href="#"
				key="enter-password-link"
				onClick={ this.onClickEnterPasswordInstead }>
					{ translate( 'Enter a password instead' ) }
				</a>;
		}

		const backToWpcomLink = ! magicLoginView && (
			<a
				href="https://wordpress.com"
				key="return-to-wpcom-link"
			>
				<Gridicon icon="arrow-left" size={ 18 } /> { translate( 'Back to WordPress.com' ) }
			</a>
		);

		const showMagicLoginLink = magicLoginEnabled && ! magicLoginView && ! twoFactorAuthType && (
			<a href="#"
				key="magic-login-link"
				onClick={ this.onMagicLoginRequestClick }>
					{ translate( 'Email me a log in link' ) }
			</a>
		);

		const resetPasswordLink = ! magicLoginView && ! twoFactorAuthType && (
			<a
				href={ config( 'login_url' ) + '?action=lostpassword' }
				key="lost-password-link">
				{ this.props.translate( 'Lost your password?' ) }
			</a>
		);

		const lostPhoneLink = twoFactorAuthType && twoFactorAuthType !== 'backup' && (
			<a
				href={ login( { isNative: true, twoFactorAuthType: 'backup' } ) }
				key="lost-phone-link">
				{ this.props.translate( "I can't access my phone" ) }
			</a>
		);

		const helpLink = twoFactorAuthType && (
			<ExternalLink
				key="help-link"
				icon={ true }
				target="_blank"
				href="http://en.support.wordpress.com/security/two-step-authentication/">
				{ translate( 'Get help' ) }
			</ExternalLink>
		);

		return compact( [
			lostPhoneLink,
			helpLink,
			showMagicLoginLink,
			resetPasswordLink,
			backToWpcomLink,
		] );
	}

	render() {
		const {
			magicLoginView,
			queryArguments,
			twoFactorAuthType,
		} = this.props;

		return (
			<Main className="wp-login">
				<PageViewTracker path="/login" title="Login" />

				<GlobalNotices id="notices" notices={ notices.list } />

				{ this.magicLoginMainContent() || (
					<div>
						<div className="wp-login__container">
							{ magicLoginView === REQUEST_FORM
								? <RequestLoginEmailForm />
								: <LoginBlock
									twoFactorAuthType={ twoFactorAuthType }
									redirectLocation={ queryArguments.redirect_to } />
							}
						</div>
						<div className="wp-login__footer">
							{ this.footerLinks() }
						</div>
					</div>
				) }
			</Main>
		);
	}
}

const mapState = state => {
	const magicLoginEnabled = isEnabled( 'magic-login' );
	return {
		magicLoginEnabled,
		magicLoginEmailAddress: getMagicLoginEmailAddressFormInput( state ),
		magicLoginView: magicLoginEnabled ? getMagicLoginCurrentView( state ) : null,
		queryArguments: getCurrentQueryArguments( state ),
	};
};

const mapDispatch = {
	hideMagicLoginRequestForm,
	showMagicLoginInterstitialPage,
	showMagicLoginRequestForm,
	recordTracksEvent,
};

export default connect( mapState, mapDispatch )( localize( Login ) );
