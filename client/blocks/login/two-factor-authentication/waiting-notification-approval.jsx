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
import Button from 'components/button';
import Card from 'components/card';
import ExternalLink from 'components/external-link';
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
			<form>
				<Card className="two-factor-authentication__push-notification-screen is-compact">
					<p>
						{ translate( 'We sent a push notification to your {{strong}}WordPress mobile app{{/strong}}. ' +
							'Once you get it and swipe or tap to confirm, this page will update.' ) }
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
						<Button onClick={ this.verifyWithCodeInstead }>
							{ translate( 'Verify with Authenticator App' ) }
						</Button>

						<div>{ translate( 'Code Via Text Message' ) }</div>
					</p>
				</Card>
				<p>
					<ExternalLink
						icon={ true }
						target="_blank"
						href="http://en.support.wordpress.com/security/two-step-authentication/">
						{ translate( 'Help' ) }
					</ExternalLink>
				</p>
				{ isSmsAuthSupported && (
					<p>
						<a href="#" onClick={ this.sendSmsCode }>{ translate( 'A recovery code via text' ) }</a>
					</p>
				) }
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
		errorNotice,
		sendSmsCode,
		startPollAppPushAuth,
		stopPollAppPushAuth,
		successNotice,
	}
)( localize( WaitingTwoFactorNotificationApproval ) );
