/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import LoginForm from './login-form';
import { getTwoFactorAuthNonce, getTwoFactorNotificationSent, isTwoFactorEnabled } from 'state/login/selectors';
import VerificationCodeForm from './two-factor-authentication/verification-code-form';
import WaitingTwoFactorNotificationApproval from './two-factor-authentication/waiting-notification-approval';
import { login } from 'lib/paths';

class Login extends Component {
	static propTypes = {
		redirectLocation: PropTypes.string,
		title: PropTypes.string,
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
			page( login() );
		}
	};

	handleValidUsernamePassword = () => {
		if ( ! this.props.twoFactorEnabled ) {
			this.rebootAfterLogin();
		} else {
			page( login( { twoFactorAuthType: this.props.twoFactorNotificationSent === 'push' ? 'push' : 'code' } ) );
		}
	};

	rebootAfterLogin = () => {
		window.location.href = this.props.redirectLocation || window.location.origin;
	};

	renderContent() {
		const {
			title,
			twoFactorAuthType,
			twoStepNonce,
		} = this.props;

		const {
			rememberMe,
		} = this.state;

		if ( twoStepNonce && twoFactorAuthType === 'code' ) {
			return (
				<VerificationCodeForm rememberMe={ rememberMe } onSuccess={ this.rebootAfterLogin } />
			);
		}

		if ( twoStepNonce && twoFactorAuthType === 'push' ) {
			return (
				<WaitingTwoFactorNotificationApproval onSuccess={ this.rebootAfterLogin } />
			);
		}

		return (
			<LoginForm
				title={ title }
				onSuccess={ this.handleValidUsernamePassword } />
		);
	}

	render() {
		return (
			<div>
				{ this.renderContent() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
		twoStepNonce: getTwoFactorAuthNonce( state ),
	} ),
)( Login );
