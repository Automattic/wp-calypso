import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { comment } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export const NotificationsCommentsSummary = () => {
	return (
		<RouterLinkSummaryButton
			to="/me/notifications/comments"
			title={ __( 'Comments' ) }
			description={ __(
				'Set your notification preferences for activity on comments you’ve made on other sites.'
			) }
			decoration={ <Icon icon={ comment } /> }
		/>
	);
};
