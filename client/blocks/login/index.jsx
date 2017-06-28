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
import LoginForm from './login-form';
import {
	getRedirectTo,
	getRequestError,
	getRequestNotice,
	getTwoFactorAuthRequestError,
	getTwoFactorNotificationSent,
	getCreateSocialAccountError,
	getRequestSocialAccountError,
	isTwoFactorEnabled,
} from 'state/login/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import VerificationCodeForm from './two-factor-authentication/verification-code-form';
import WaitingTwoFactorNotificationApproval from './two-factor-authentication/waiting-notification-approval';
import { login } from 'lib/paths';
import Notice from 'components/notice';
import PushNotificationApprovalPoller from './two-factor-authentication/push-notification-approval-poller';
import userFactory from 'lib/user';

const user = userFactory();

class Login extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		requestError: PropTypes.object,
		requestNotice: PropTypes.object,
		twoFactorAuthType: PropTypes.string,
		twoFactorAuthRequestError: PropTypes.object,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,
	};

	componentDidMount = () => {
		if ( ! this.props.twoFactorEnabled && this.props.twoFactorAuthType ) {
			// Disallow access to the 2FA pages unless the user has 2FA enabled
			page( login( { isNative: true } ) );
		}
	};

	componentWillReceiveProps = ( nextProps ) => {
		const hasLoginError = this.props.requestError !== nextProps.requestError;
		const hasTwoFactorAuthError = this.props.twoFactorAuthRequestError !== nextProps.twoFactorAuthRequestError;
		const hasNotice = this.props.requestNotice !== nextProps.requestNotice;
		const isNewPage = this.props.twoFactorAuthType !== nextProps.twoFactorAuthType;

		if ( isNewPage || hasLoginError || hasTwoFactorAuthError || hasNotice ) {
			window.scrollTo( 0, 0 );
		}
	};

	handleValidUsernamePassword = () => {
		if ( ! this.props.twoFactorEnabled ) {
			this.rebootAfterLogin();
		} else {
			page( login( {
				isNative: true,
				// If no notification is sent, the user is using the authenticator for 2FA by default
				twoFactorAuthType: this.props.twoFactorNotificationSent.replace( 'none', 'authenticator' )
			} ) );
		}
	};

	rebootAfterLogin = () => {
		const { redirectTo } = this.props;

		this.props.recordTracksEvent( 'calypso_login_success', {
			two_factor_enabled: this.props.twoFactorEnabled
		} );

		// Redirects to / if no redirect url is available
		const url = redirectTo ? redirectTo : window.location.origin;

		// user data is persisted in localstorage at `lib/user/user` line 157
		// therefor we need to reset it before we redirect, otherwise we'll get
		// mixed data from old and new user
		user.clear();

		window.location.href = url;
	};

	renderError() {
		const error = this.props.requestError ||
			this.props.twoFactorAuthRequestError ||
			this.props.requestAccountError ||
			this.props.createAccountError && this.props.createAccountError.code !== 'unknown_user' ? this.props.createAccountError : null;

		if ( ! error || ( error.field && error.field !== 'global' ) || ! error.message ) {
			return null;
		}

		return (
			<Notice status={ 'is-error' } showDismiss={ false }>
				{ error.message }
			</Notice>
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
						twoFactorAuthType={ twoFactorAuthType }
					/>
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

		return (
			<LoginForm onSuccess={ this.handleValidUsernamePassword } />
		);
	}

	render() {
		const { translate, twoStepNonce } = this.props;

		return (
			<div>
				<div className="login__form-header">
					{ twoStepNonce ? translate( 'Two-Step Authentication' ) : translate( 'Log in to your account.' ) }
				</div>

				{ this.renderError() }

				{ this.renderNotice() }

				{ this.renderContent() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		redirectTo: getRedirectTo( state ),
		createAccountError: getCreateSocialAccountError( state ),
		requestAccountError: getRequestSocialAccountError( state ),
		requestError: getRequestError( state ),
		requestNotice: getRequestNotice( state ),
		twoFactorAuthRequestError: getTwoFactorAuthRequestError( state ),
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
	} ), {
		recordTracksEvent,
	}
)( localize( Login ) );
