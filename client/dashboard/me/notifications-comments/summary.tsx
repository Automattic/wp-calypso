import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { comment } from '@wordpress/icons';
import { notificationsCommentsRoute } from '../../app/router/me';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export const NotificationsCommentsSummary = () => {
	return (
		<RouterLinkSummaryButton
			to={ notificationsCommentsRoute.fullPath }
			title={ __( 'Comments' ) }
			description={ __(
				'Set your notification preferences for activity on comments you’ve made on other sites.'
			) }
			decoration={ <Icon icon={ comment } /> }
		/>
	);
};
