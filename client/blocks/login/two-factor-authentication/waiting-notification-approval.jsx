/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

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
import TwoFactorActions from './two-factor-actions';

class WaitingTwoFactorNotificationApproval extends Component {
	static propTypes = {
		onSuccess: PropTypes.func.isRequired,
		pushSuccess: PropTypes.bool.isRequired,
		setNotice: PropTypes.func.isRequired,
		startPollAppPushAuth: PropTypes.func.isRequired,
		stopPollAppPushAuth: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
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

	render() {
		const { translate } = this.props;

		return (
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

				<TwoFactorActions
					setNotice={ this.props.setNotice }
					twoFactorAuthType="push"
				/>
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
		startPollAppPushAuth,
		stopPollAppPushAuth,
	}
)( localize( WaitingTwoFactorNotificationApproval ) );
