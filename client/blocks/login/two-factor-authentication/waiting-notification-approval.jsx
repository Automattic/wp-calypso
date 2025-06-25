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
			<Card className="two-factor-authentication__push-notification-approval">
				<p className="two-factor-authentication__info">
					{ translate(
						'Check your device. Approve your login with the Jetpack or WordPress mobile app.'
					) }
				</p>
				<PushNotificationIllustration />
				<FormDivider isHorizontal />
				<TwoFactorActions
					twoFactorAuthType="push"
					switchTwoFactorAuthType={ switchTwoFactorAuthType }
				/>
			</Card>
		</Fragment>
	);
}
