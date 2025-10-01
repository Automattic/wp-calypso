import { userSettingsQuery } from '@automattic/api-queries';
import { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { layout } from '@wordpress/icons';
import { useMemo } from 'react';
import RouterLinkSummaryButton from '../../../components/router-link-summary-button';

export const NotificationsEmailsSummary = () => {
	const { data: settings } = useSuspenseQuery( userSettingsQuery() );
	const isAllWpcomEmailsDisabled = settings.subscription_delivery_email_blocked;

	const badges = useMemo(
		() =>
			isAllWpcomEmailsDisabled
				? [ { text: __( 'All emails are paused' ), intent: 'warning' } ]
				: [],
		[ isAllWpcomEmailsDisabled ]
	) as SummaryButtonBadgeProps[];

	return (
		<RouterLinkSummaryButton
			to="/me/notifications/emails"
			title={ __( 'Emails' ) }
			description={ __(
				'Manage how you receive emails. Set the frequency, choose a format, or pause all emails. To manage individual site subscriptions, go to the Reader.'
			) }
			decoration={ <Icon icon={ layout } /> }
			badges={ badges }
		/>
	);
};
