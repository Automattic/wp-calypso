import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { layout } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export const NotificationsSitesSummary = () => {
	return (
		<RouterLinkSummaryButton
			to="/me/notifications/sites"
			title={ __( 'Sites' ) }
			description={ __(
				'Set your notification preferences for different site activities, such as new comments, mentions or followers. Choose to be notified by email, in-product, or both.'
			) }
			decoration={ <Icon icon={ layout } /> }
		/>
	);
};
