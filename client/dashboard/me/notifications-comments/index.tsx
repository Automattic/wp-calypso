import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import NotificationsPageHeader from '../notifications-page-header';

export default function NotificationsComments() {
	return (
		<PageLayout
			size="small"
			header={
				<NotificationsPageHeader
					title={ __( 'Comments' ) }
					description={ __(
						'Set your notification preferences for activity on comments you’ve made on other sites.'
					) }
				/>
			}
		></PageLayout>
	);
}
