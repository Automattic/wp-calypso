import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SummaryButtonList } from '../../components/summary-button-list';
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
			<SummaryButtonList>
				<NotificationsSitesSummary />
				<NotificationsCommentsSummary />
				<NotificationsEmailsSummary />
				<NotificationsExtrasSummary />
			</SummaryButtonList>
		</PageLayout>
	);
}

export default Notifications;
