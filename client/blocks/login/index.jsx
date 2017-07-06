/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import ErrorNotice from './error-notice';
import LoginForm from './login-form';
import {
	getRedirectTo,
	getRequestNotice,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
	getLinkingSocialUser,
	getLinkingSocialService,
	isConnectingSocialService,
} from 'state/login/selectors';
import { connectSocialAccount } from 'state/login/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import VerificationCodeForm from './two-factor-authentication/verification-code-form';
import WaitingTwoFactorNotificationApproval from './two-factor-authentication/waiting-notification-approval';
import { login } from 'lib/paths';
import Notice from 'components/notice';
import PushNotificationApprovalPoller from './two-factor-authentication/push-notification-approval-poller';
import userFactory from 'lib/user';
import SocialConnectPrompt from './social-connect-prompt';

const user = userFactory();

class Login extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		requestNotice: PropTypes.object,
		twoFactorAuthType: PropTypes.string,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,
		socialConnect: PropTypes.bool,
		linkingSocialUser: PropTypes.string,
		linkingSocialService: PropTypes.string,
		connectingSocialService: PropTypes.bool,
		connectSocialAccount: PropTypes.func,
	};

	componentDidMount = () => {
		if ( ! this.props.twoFactorEnabled && this.props.twoFactorAuthType ) {
			// Disallow access to the 2FA pages unless the user has 2FA enabled
			page( login( { isNative: true } ) );
		}

		window.scrollTo( 0, 0 );
	};

	componentWillReceiveProps = ( nextProps ) => {
		const hasNotice = this.props.requestNotice !== nextProps.requestNotice;
		const isSocialConnectPage = this.props.socialConnect !== nextProps.socialConnect;
		const isNewPage = this.props.twoFactorAuthType !== nextProps.twoFactorAuthType || isSocialConnectPage;

		if ( isSocialConnectPage ) {
			this.forceUpdate();
		}

		if ( isNewPage || hasNotice ) {
			window.scrollTo( 0, 0 );
		}
	};

	handleValidUsernamePassword = () => {
		if ( this.props.twoFactorEnabled ) {
			page( login( {
				isNative: true,
				// If no notification is sent, the user is using the authenticator for 2FA by default
				twoFactorAuthType: this.props.twoFactorNotificationSent.replace( 'none', 'authenticator' )
			} ) );
		} else if ( this.props.linkingSocialUser ) {
			page( login( {
				isNative: true,
				socialConnect: true,
			} ) );
		} else {
			this.rebootAfterLogin();
		}
	};

	rebootAfterLogin = () => {
		const { redirectTo } = this.props;

		this.props.recordTracksEvent( 'calypso_login_success', {
			two_factor_enabled: this.props.twoFactorEnabled,
			social_service_connected: this.props.socialConnect,
		} );

		// Redirects to / if no redirect url is available
		const url = redirectTo ? redirectTo : window.location.origin;

		// user data is persisted in localstorage at `lib/user/user` line 157
		// therefor we need to reset it before we redirect, otherwise we'll get
		// mixed data from old and new user
		user.clear();

		window.location.href = url;
	};

	renderHeader() {
		const {
			socialConnect,
			translate,
			twoStepNonce,
			linkingSocialService,
		} = this.props;
		let headerText;

		if ( twoStepNonce ) {
			headerText = translate( 'Two-Step Authentication' );
		} else if ( socialConnect ) {
			headerText = translate( 'Connect your %(service)s account.', {
				args: {
					service: linkingSocialService,
				}
			} );
		} else {
			headerText = translate( 'Log in to your account.' );
		}

		return (
			<div className="login__form-header">
				{ headerText }
			</div>
		);
	}

	renderNotice() {
		const { requestNotice } = this.props;

		if ( ! requestNotice ) {
			return null;
		}

		return (
			<Notice status={ requestNotice.status } showDismiss={ false }>
				{ requestNotice.message }
			</Notice>
		);
	}

	renderContent() {
		const {
			twoFactorAuthType,
			twoFactorEnabled,
			twoFactorNotificationSent,
			socialConnect,
		} = this.props;

		let poller;
		if ( twoFactorEnabled && twoFactorAuthType && twoFactorNotificationSent === 'push' ) {
			poller = <PushNotificationApprovalPoller onSuccess={ this.rebootAfterLogin } />;
		}

		if ( twoFactorEnabled && includes( [ 'authenticator', 'sms', 'backup' ], twoFactorAuthType ) ) {
			return (
				<div>
					{ poller }
					<VerificationCodeForm
						onSuccess={ this.rebootAfterLogin }
						twoFactorAuthType={ twoFactorAuthType } />
				</div>
			);
		}

		if ( twoFactorEnabled && twoFactorAuthType === 'push' ) {
			return (
				<div>
					{ poller }
					<WaitingTwoFactorNotificationApproval />
				</div>
			);
		}

		if ( socialConnect ) {
			return (
				<div>
					<SocialConnectPrompt onSuccess={ this.rebootAfterLogin } />
				</div>
			);
		}

		return (
			<LoginForm onSuccess={ this.handleValidUsernamePassword } />
		);
	}

	render() {
		return (
			<div>
				{ this.renderHeader() }

				<ErrorNotice />

				{ this.renderNotice() }

				{ this.renderContent() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		redirectTo: getRedirectTo( state ),
		requestNotice: getRequestNotice( state ),
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
		linkingSocialUser: getLinkingSocialUser( state ),
		linkingSocialService: getLinkingSocialService( state ),
		connectingSocialService: isConnectingSocialService( state ),
	} ), {
		recordTracksEvent,
		connectSocialAccount,
	}
)( localize( Login ) );
