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
import DocumentHead from 'components/data/document-head';
import LoginForm from './login-form';
import {
	getRequestError,
	getRequestNotice,
	getTwoFactorAuthRequestError,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
} from 'state/login/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import VerificationCodeForm from './two-factor-authentication/verification-code-form';
import WaitingTwoFactorNotificationApproval from './two-factor-authentication/waiting-notification-approval';
import { login } from 'lib/paths';
import Notice from 'components/notice';
import PushNotificationApprovalPoller from './two-factor-authentication/push-notification-approval-poller';

class Login extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		redirectLocation: PropTypes.string,
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
		this.props.recordTracksEvent( 'calypso_login_success', {
			two_factor_enabled: this.props.twoFactorEnabled
		} );

		const { redirectLocation } = this.props;

		let newHref;

		if ( redirectLocation && redirectLocation.match( /^(?!\/\/)[\/\-a-z0-9.]+$/i ) ) {
			// only redirect to paths on the current domain
			newHref = redirectLocation;
		} else {
			newHref = window.location.origin;
		}

		window.location.href = newHref;
	};

	renderError() {
		const error = this.props.requestError || this.props.twoFactorAuthRequestError;

		if ( ! error || error.field !== 'global' ) {
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
				<DocumentHead title={ translate( 'Log In', { textOnly: true } ) } />

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
		requestError: getRequestError( state ),
		requestNotice: getRequestNotice( state ),
		twoFactorAuthRequestError: getTwoFactorAuthRequestError( state ),
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
	} ), {
		recordTracksEvent,
	}
)( localize( Login ) );
