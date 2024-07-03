import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import { FormDivider } from 'calypso/blocks/authentication';
import PushNotificationIllustration from './push-notification-illustration';
import TwoFactorActions from './two-factor-actions';

import './waiting-notification-approval.scss';

export default function WaitingTwoFactorNotificationApproval( { switchTwoFactorAuthType } ) {
	const translate = useTranslate();

	return (
		<Fragment>
			<Card compact>
				<p className="two-factor-authentication__info">
					{ translate(
						'Notification sent! Confirm in your Jetpack or WordPress {{strong}}\u00A0mobile\u00A0app{{/strong}} to\u00A0continue.',
						{ components: { strong: <strong /> } }
					) }
				</p>
				<PushNotificationIllustration />
			</Card>
			<FormDivider isHorizontal />
			<TwoFactorActions
				twoFactorAuthType="push"
				switchTwoFactorAuthType={ switchTwoFactorAuthType }
			/>
		</Fragment>
	);
}
