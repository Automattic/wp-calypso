import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { layout } from '@wordpress/icons';
import { notificationsEmailsRoute } from '../../app/router/me';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export const NotificationsEmailsSummary = () => {
	return (
		<RouterLinkSummaryButton
			to={ notificationsEmailsRoute.fullPath }
			title={ __( 'Emails' ) }
			description={ __(
				'Manage how you receive emails. Set the frequency, choose a format, or pause all emails. To manage individual site subscriptions'
			) }
			decoration={ <Icon icon={ layout } /> }
		/>
	);
};
