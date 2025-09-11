import { notificationPushPermissionStateQuery } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BrowserNotificationCard } from './browser-notification-card';
import { BrowserNotificationNotice } from './browser-notification-notice';

export default function NotificationsSites() {
	const { data: status } = useQuery( notificationPushPermissionStateQuery() );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Sites' ) }
					description={ __(
						'Set your notification preferences for different site activities, such as new comments, mentions or followers. Choose to be notified by email, in-product, or both.'
					) }
				/>
			}
		>
			{ status === 'denied' && <BrowserNotificationNotice /> }

			<VStack spacing={ 4 }>
				<BrowserNotificationCard status={ status } />
			</VStack>
		</PageLayout>
	);
}
