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
	getTwoFactorAuthNonce,
	getRequestError,
	getRequestNotice,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled
} from 'state/login/selectors';
import VerificationCodeForm from './two-factor-authentication/verification-code-form';
import WaitingTwoFactorNotificationApproval from './two-factor-authentication/waiting-notification-approval';
import { login } from 'lib/paths';
import Notice from 'components/notice';

class Login extends Component {
	static propTypes = {
		redirectLocation: PropTypes.string,
		requestError: PropTypes.object,
		getRequestNotice: PropTypes.object,
		twoFactorAuthType: PropTypes.string,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,
		twoStepNonce: PropTypes.string,
	};

	state = {
		rememberMe: false,
	};

	componentWillMount = () => {
		if ( ! this.props.twoStepNonce && this.props.twoFactorAuthType && typeof window !== 'undefined' ) {
			// Disallow access to the 2FA pages unless the user has received a nonce
			page( login( { isNative: true } ) );
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
		window.location.href = this.props.redirectLocation || window.location.origin;
	};

	renderError() {
		const { requestError } = this.props;

		if ( ! requestError || requestError.field !== 'global' ) {
			return null;
		}

		return (
			<Notice status={ 'is-error' } showDismiss={ false }>{ requestError.message }</Notice>
		);
	}

	renderNotice() {
		const { requestNotice } = this.props;

		if ( ! requestNotice ) {
			return null;
		}

		return (
			<Notice status={ requestNotice.status } showDismiss={ false }>{ requestNotice.message }</Notice>
		);
	}

	renderContent() {
		const {
			twoFactorAuthType,
			twoStepNonce,
		} = this.props;

		const {
			rememberMe,
		} = this.state;

		if ( twoStepNonce && includes( [ 'authenticator', 'sms', 'backup' ], twoFactorAuthType ) ) {
			return (
				<VerificationCodeForm
					rememberMe={ rememberMe }
					onSuccess={ this.rebootAfterLogin }
					twoFactorAuthType={ twoFactorAuthType }
				/>
			);
		}

		if ( twoStepNonce && twoFactorAuthType === 'push' ) {
			return (
				<WaitingTwoFactorNotificationApproval onSuccess={ this.rebootAfterLogin } />
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
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
		twoStepNonce: getTwoFactorAuthNonce( state ),
	} ),
)( localize( Login ) );
