/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import VerificationCodeForm from './verification-code-form';
import WaitingTwoFactorNotificationApproval from './waiting-notification-approval';
import { getTwoFactorNotificationSent } from 'state/login/selectors';

const TwoFactorAuthentication = ( { twoFactorNotificationSent, onSuccess, rememberMe } ) => {
	if ( twoFactorNotificationSent === 'push' ) {
		return (
			<WaitingTwoFactorNotificationApproval onSuccess={ onSuccess } />
		);
	}

	return (
		<VerificationCodeForm rememberMe={ rememberMe } onSuccess={ onSuccess } />
	);
};

TwoFactorAuthentication.propTypes = {
	onSuccess: PropTypes.func.isRequired,
	rememberMe: PropTypes.bool.isRequired,
	twoFactorNotificationSent: PropTypes.string.isRequired,
};

export default connect( ( state ) => ( {
	twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
} ) )( TwoFactorAuthentication );
