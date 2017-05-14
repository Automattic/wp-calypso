/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { compact } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import {
	CHECK_YOUR_EMAIL_PAGE,
	INTERSTITIAL_PAGE,
	LINK_EXPIRED_PAGE,
} from 'state/login/magic-login/constants';
import config, { isEnabled } from 'config';
import EmailedLoginLinkSuccessfully from '../magic-login/emailed-login-link-successfully';
import EmailedLoginLinkExpired from '../magic-login/emailed-login-link-expired';
import {
	getMagicLoginEmailAddressFormInput,
	getMagicLoginCurrentView,
} from 'state/selectors';
import { getCurrentQueryArguments } from 'state/ui/selectors';
import HandleEmailedLinkForm from '../magic-login/handle-emailed-link-form';
import {
	hideMagicLoginRequestForm,
	showMagicLoginInterstitialPage,
	showMagicLoginRequestForm,
} from 'state/login/magic-login/actions';
import Main from 'components/main';
import RequestLoginEmailForm from '../magic-login/request-login-email-form';
import { recordTracksEvent } from 'state/analytics/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import { login } from 'lib/paths';

class MagicLogin extends React.Component {
	static propTypes = {
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		magicLoginEmailAddress: PropTypes.string,
		magicLoginEnabled: PropTypes.bool,
		magicLoginView: PropTypes.string,
		recordTracksEvent: PropTypes.func.isRequired,
		showMagicLoginInterstitialPage: PropTypes.func.isRequired,
		showMagicLoginRequestForm: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	onClickEnterPasswordInstead = event => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_enter_password_instead_click' );

		page( login() );
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

	render() {
		const {
			translate,
		} = this.props;

		return (
			<Main className="wp-login">
				<PageViewTracker path="/login" title="Login" />

				<GlobalNotices id="notices" notices={ notices.list } />

				{ this.magicLoginMainContent() || (
					<div>
						<div className="wp-login__container">
							<RequestLoginEmailForm />
						</div>
						<div className="wp-login__footer">
							<a href="#"
								key="enter-password-link"
								onClick={ this.onClickEnterPasswordInstead }>
								{ translate( 'Enter a password instead' ) }
							</a>
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

export default connect( mapState, mapDispatch )( localize( MagicLogin ) );
