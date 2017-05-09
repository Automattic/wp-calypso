/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import {
	startPollAppPushAuth,
	stopPollAppPushAuth,
} from 'state/login/actions';
import {
	getTwoFactorUserId,
	getTwoFactorAuthNonce,
	isTwoFactorAuthTypeSupported,
	getTwoFactorPushPollSuccess,
} from 'state/login/selectors';

import { sendSmsCode } from 'state/login/actions';
import { errorNotice, successNotice } from 'state/notices/actions';

class WaitingTwoFactorNotificationApproval extends Component {
	static propTypes = {
		onSuccess: PropTypes.func.isRequired,
		pushSuccess: PropTypes.bool.isRequired,
		startPollAppPushAuth: PropTypes.func.isRequired,
		stopPollAppPushAuth: PropTypes.func.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		errorNotice: PropTypes.func.isRequired,
		isSmsAuthSupported: PropTypes.bool.isRequired,
		successNotice: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	sendSmsCode = ( event ) => {
		event.preventDefault();

		const { userId, twoStepNonce, translate } = this.props;

		this.props.sendSmsCode( userId, twoStepNonce ).then( () => {
			this.props.successNotice( translate( 'Recovery code has been sent.' ) );
		} ).catch( ( errorMessage ) => {
			this.props.errorNotice( errorMessage );
		} );
	};

	componentDidMount() {
		this.props.startPollAppPushAuth();
	}

	componentWillUnmount() {
		this.props.stopPollAppPushAuth();
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.pushSuccess && nextProps.pushSuccess ) {
			const { translate } = this.props;
			this.props.successNotice( translate( 'Verified successfully!' ) );
			this.props.onSuccess();
		}
	}

	render() {
		const {
			isSmsAuthSupported,
			translate,
		} = this.props;

		return (
			<form>
				<Card className="two-factor-authentication__push-notification-screen is-compact">
					<p>
						{ translate( 'We just sent a push notification to your WordPress mobile app. ' +
							'Swipe or tap to open and verify your login.' ) }
					</p>
					<div>
						<img className="two-factor-authentication__auth-code-preview"
							src="/calypso/images/login/pushauth.svg" />
					</div>
				</Card>
				<Card className="two-factor-authentication__form-action is-compact">
					<p>
						{ translate( 'Or, continue to your account using:' ) }
					</p>
					{ isSmsAuthSupported && (
						<p>
							<a href="#" onClick={ this.sendSmsCode }>{ translate( 'A recovery code via text' ) }</a>
						</p>
					) }
					<p>
						<a href="#">{ translate( 'An Authenticator application' ) }</a>
					</p>
				</Card>
			</form>
		);
	}
}

export default connect(
	( state ) => ( {
		isSmsAuthSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
		twoStepNonce: getTwoFactorAuthNonce( state ),
		userId: getTwoFactorUserId( state ),
		pushSuccess: getTwoFactorPushPollSuccess( state ),
	} ),
	{
		sendSmsCode,
		errorNotice,
		successNotice,
		startPollAppPushAuth,
		stopPollAppPushAuth,
	}
)( localize( WaitingTwoFactorNotificationApproval ) );
