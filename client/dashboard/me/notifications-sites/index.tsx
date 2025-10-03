import { notificationPushPermissionStateQuery } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Suspense } from 'react';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BrowserNotificationCard } from './browser-notification-card';
import { BrowserNotificationNotice } from './browser-notification-notice';
import { Loading } from './loading';
import { SiteListSettings } from './site-list-settings';

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

			<VStack spacing={ 8 }>
				<BrowserNotificationCard status={ status } />
				<Suspense fallback={ <Loading /> }>
					<SiteListSettings />
				</Suspense>
			</VStack>
		</PageLayout>
	);
}
