/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import VerificationCodeForm from './verification-code-form';
import WaitingTwoFactorNotificationApproval from './waiting-notification-approval';
import { getTwoFactorNotificationSent } from 'state/login/selectors';
import { localize } from 'i18n-calypso';

class Login2FA extends Component {
	static propTypes = {
		onSuccess: PropTypes.func.isRequired,
		rememberMe: PropTypes.bool.isRequired,
		twoFactorNotificationSent: PropTypes.string.isRequired,
	};

	render() {
		const { twoFactorNotificationSent, onSuccess, rememberMe } = this.props;

		if ( twoFactorNotificationSent === 'push' ) {
			return (
				<WaitingTwoFactorNotificationApproval onSuccess={ onSuccess } />
			);
		}

		return (
			<VerificationCodeForm rememberMe={ rememberMe } onSuccess={ onSuccess } />
		);
	}
}

export default connect( ( state ) => ( {
	twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
} ) )( localize( Login2FA ) );
