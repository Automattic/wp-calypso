import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { NotificationsCommentsSummary } from '../notifications-comments/summary';
import { NotificationsEmailsSummary } from '../notifications-emails/summary';
import { NotificationsExtrasSummary } from '../notifications-extras/summary';
import { NotificationsSitesSummary } from '../notifications-sites/summary';

function Notifications() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Notifications' ) }
					description={ __(
						'Control your notification preferences for site activity, comments, updates, and subscriptions.'
					) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<NotificationsSitesSummary />
				<NotificationsCommentsSummary />
				<NotificationsEmailsSummary />
				<NotificationsExtrasSummary />
			</VStack>
		</PageLayout>
	);
}

export default Notifications;
