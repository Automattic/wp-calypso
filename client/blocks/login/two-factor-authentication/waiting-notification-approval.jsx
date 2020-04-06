/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import PushNotificationIllustration from './push-notification-illustration';
import TwoFactorActions from './two-factor-actions';
import Divider from '../divider';

/**
 * Style dependencies
 */
import './waiting-notification-approval.scss';

export default function WaitingTwoFactorNotificationApproval( { isJetpack, isGutenboarding } ) {
	const translate = useTranslate();

	return (
		<Fragment>
			<Card compact>
				<p className="two-factor-authentication__info">
					{ translate(
						'Notification sent! Confirm in your {{strong}}WordPress\u00A0mobile\u00A0app{{/strong}} to\u00A0continue.',
						{ components: { strong: <strong /> } }
					) }
				</p>
				<PushNotificationIllustration />
			</Card>
			<Divider>{ translate( 'or' ) }</Divider>
			<TwoFactorActions
				twoFactorAuthType="push"
				isJetpack={ isJetpack }
				isGutenboarding={ isGutenboarding }
			/>
		</Fragment>
	);
}
