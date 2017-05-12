/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
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
import { errorNotice, successNotice } from 'state/notices/actions';
import { sendSmsCode } from 'state/login/actions';
import { login } from 'lib/paths';

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
		page( login( { twoFactorAuthType: 'sms' } ) );

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
			this.props.successNotice( translate( 'Logging In…' ) );
			this.props.onSuccess();
		}
	}

	verifyWithCodeInstead = ( event ) => {
		event.preventDefault();

		page( login( { twoFactorAuthType: 'code' } ) );
	};

	render() {
		const {
			isSmsAuthSupported,
			translate,
		} = this.props;

		return (
			<div>
				<div className="two-factor-authentication__header">
					{ this.props.title }
				</div>

				<form>
					<Card className="two-factor-authentication__push-notification-screen is-compact">
						<p>
							{ translate( 'We sent a push notification to your {{strong}}WordPress mobile app{{/strong}}. ' +
								'Once you get it and swipe or tap to confirm, this page will update.', {
									components: {
										strong: <strong />
									}
								} ) }
						</p>
						<div>
							<img className="two-factor-authentication__auth-code-preview"
								src="/calypso/images/login/pushauth.svg" />
						</div>
					</Card>
					<Card className="two-factor-authentication__form-action is-compact">
						<p>
							{ translate( 'Or continue to your account using:' ) }
						</p>
						<p>
							<a href="#" onClick={ this.verifyWithCodeInstead }>
								{ translate( 'An Authenticator App' ) }
							</a>
						</p>

						{ isSmsAuthSupported && (
							<p>
								<a href="#" onClick={ this.sendSmsCode }>{ translate( 'Code Via Text Message' ) }</a>
							</p>
						) }
					</Card>
				</form>
			</div>
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
		errorNotice,
		sendSmsCode,
		startPollAppPushAuth,
		stopPollAppPushAuth,
		successNotice,
	}
)( localize( WaitingTwoFactorNotificationApproval ) );
