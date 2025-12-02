import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { layout } from '@wordpress/icons';
import { notificationsSitesRoute } from '../../app/router/me';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export const NotificationsSitesSummary = () => {
	return (
		<RouterLinkSummaryButton
			to={ notificationsSitesRoute.fullPath }
			title={ __( 'Sites' ) }
			description={ __(
				'Set your notification preferences for different site activities, such as new comments, mentions or followers. Choose to be notified by email, in-product, or both.'
			) }
			decoration={ <Icon icon={ layout } /> }
		/>
	);
};
