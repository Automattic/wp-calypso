/** @format */

/**
 * External dependencies
 */

import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PushNotificationIllustration from './push-notification-illustration';
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
					<p className="two-factor-authentication__info">
						{ translate(
							'Notification sent! Confirm in your {{strong}}WordPress\u00A0mobile\u00A0app{{/strong}} to\u00A0continue.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>

					<PushNotificationIllustration />
				</Card>

				<div className="two-factor-authentication__actions">
					<div className="two-factor-authentication__actions-divider">
						<span>{ this.props.translate( 'or' ) }</span>
					</div>

					<TwoFactorActions twoFactorAuthType="push" />
				</div>
			</form>
		);
	}
}

export default localize( WaitingTwoFactorNotificationApproval );
