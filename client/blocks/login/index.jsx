/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
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
			page( login( {
				// If no notification is sent, the user is using the authenticator for 2FA by default
				twoFactorAuthType: this.props.twoFactorNotificationSent.replace( 'none', 'authenticator' )
			} ) );
		}
	};

	rebootAfterLogin = () => {
		window.location.href = this.props.redirectLocation || window.location.origin;
	};

	renderContent() {
		const {
			twoFactorAuthType,
			twoStepNonce,
		} = this.props;

		const {
			rememberMe,
		} = this.state;

		if ( twoStepNonce && [ 'authenticator', 'sms', 'backup' ].includes( twoFactorAuthType ) ) {
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
				<div className="login__form-header">
					{ twoStepNonce ? translate( '2-Step Verification' ) : translate( 'Log in to your account.' ) }
				</div>

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
)( localize( Login ) );
