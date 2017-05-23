/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import {
	getTwoFactorUserId,
	getTwoFactorAuthNonce,
	isTwoFactorAuthTypeSupported,
	isRequestingTwoFactorAuthPushPoll,
} from 'state/login/selectors';
import { sendSmsCode, sendPushNotification } from 'state/login/actions';
import { login } from 'lib/paths';

class TwoFactorActions extends Component {
	static propTypes = {
		isAuthenticatorSupported: PropTypes.bool,
		isSmsSupported: PropTypes.bool,
		isRequestingTwoFactorAuthPushPoll: PropTypes.bool,
		sendPushNotification: PropTypes.func.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string.isRequired,
		twoStepNonce: PropTypes.string.isRequired,
	};

	state = {
		isSendingSmsCodeAfterPollingStops: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( this.state.isSendingSmsCodeAfterPollingStops &&
			this.props.isRequestingTwoFactorAuthPushPoll &&
			! nextProps.isRequestingTwoFactorAuthPushPoll ) {
			this.sendSmsCode( nextProps.twoStepNonce );
		}
	}

	handleClickSendSms = ( event ) => {
		event.preventDefault();

		if ( this.state.isSendingSmsCodeAfterPollingStops ) {
			return;
		}

		if ( this.props.isRequestingTwoFactorAuthPushPoll ) {
			// If a push request is in in progress, we need to wait for the
			// response to obtain the new two factor nonce.
			this.setState( { isSendingSmsCodeAfterPollingStops: true } );
		} else {
			this.sendSmsCode();
		}
	};

	sendSmsCode = ( twoStepNonce = this.props.twoStepNonce ) => {
		page( login( { isNative: true, twoFactorAuthType: 'sms' } ) );

		this.props.sendSmsCode( this.props.userId, twoStepNonce );
	};

	handleClickSendPush = ( event ) => {
		event.preventDefault();

		if ( this.state.isSendingPushNotificationAfterSmsResponse ) {
			return;
		}

		this.props.sendPushNotification( this.props.userId, this.props.twoStepNonce ).then( () => {
			page( login( { isNative: true, twoFactorAuthType: 'push' } ) );
		} )
		.catch( () => {
			// TODO: Display error notice
		} );
	};

	render() {
		const {
			isAuthenticatorSupported,
			isPushSupported,
			isSmsSupported,
			translate,
			twoFactorAuthType,
		} = this.props;

		if ( twoFactorAuthType === 'sms' && ! isAuthenticatorSupported && ! isPushSupported ) {
			return null;
		}

		return (
			<Card className="two-factor-authentication__form-action is-compact">
				<p>
					{ translate( 'Or continue to your account using:' ) }
				</p>

				{ isSmsSupported && twoFactorAuthType !== 'sms' && (
					<p>
						<a href="#" onClick={ this.handleClickSendSms }>
							{ translate( 'Code via text message' ) }
						</a>
					</p>
				) }

				{ isAuthenticatorSupported && twoFactorAuthType !== 'authenticator' && (
					<p>
						<a href={ login( { isNative: true, twoFactorAuthType: 'authenticator' } ) }>
							{ translate( 'Your Authenticator app' ) }
						</a>
					</p>
				) }

				{ isPushSupported && twoFactorAuthType !== 'push' && (
					<p>
						<a href="#" onClick={ this.handleClickSendPush }>
							{ translate( 'The WordPress mobile app' ) }
						</a>
					</p>
				) }
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		twoStepNonce: getTwoFactorAuthNonce( state ),
		isAuthenticatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
		isPushSupported: isTwoFactorAuthTypeSupported( state, 'push' ),
		isRequestingTwoFactorAuthPushPoll: isRequestingTwoFactorAuthPushPoll( state ),
		isSmsSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
		userId: getTwoFactorUserId( state ),
	} ),
	{
		sendSmsCode,
		sendPushNotification,
	}
)( localize( TwoFactorActions ) );
