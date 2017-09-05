import { localize } from 'i18n-calypso';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import TwoFactorActions from './two-factor-actions';

class WaitingTwoFactorNotificationApproval extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		return (
			<form>
				<Card className="two-factor-authentication__push-notification-screen is-compact">
					<p>
						{ translate(
							'We sent a push notification to your {{strong}}WordPress mobile app{{/strong}}. ' +
							'Once you get it and swipe or tap to confirm, this page will update.', {
								components: {
									strong: <strong />
								}
							} )
						}
					</p>
					<div>
						<img className="two-factor-authentication__auth-code-preview"
							src="/calypso/images/login/pushauth.svg" />
					</div>
				</Card>

				<TwoFactorActions twoFactorAuthType="push" />
			</form>
		);
	}
}

export default localize( WaitingTwoFactorNotificationApproval );
