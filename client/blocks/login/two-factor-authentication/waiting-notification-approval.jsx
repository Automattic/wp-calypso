import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import { FormDivider } from 'calypso/blocks/authentication';
import { getTwoFactorHelpText } from './get-two-factor-help-text';
import PushNotificationIllustration from './push-notification-illustration';
import TwoFactorActions from './two-factor-actions';

import './waiting-notification-approval.scss';

export default function WaitingTwoFactorNotificationApproval( {
	isGravPoweredClient,
	switchTwoFactorAuthType,
} ) {
	const translate = useTranslate();

	return (
		<Fragment>
			<Card className="two-factor-authentication__push-notification-approval">
				{ /* Every other client shows this as the subtitle of the account template. */ }
				{ isGravPoweredClient && (
					<p className="two-factor-authentication__info">
						{ getTwoFactorHelpText( 'push', false, translate ) }
					</p>
				) }
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
