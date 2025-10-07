import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Suspense } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BrowserNotificationCard } from './browser-notification-card';
import { BrowserNotificationNotice } from './browser-notification-notice';
import { Loading } from './loading';
import { PausedNotificationNotice } from './paused-notification-notice';
import { SiteListSettings } from './site-list-settings';

export default function NotificationsSites() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Sites' ) }
					description={ __(
						'Set your notification preferences for different site activities, such as new comments, mentions or followers. Choose to be notified by email, in-product, or both.'
					) }
				/>
			}
		>
			<BrowserNotificationNotice />
			<PausedNotificationNotice />

			<VStack spacing={ 8 }>
				<BrowserNotificationCard />
				<Suspense fallback={ <Loading /> }>
					<SiteListSettings />
				</Suspense>
			</VStack>
		</PageLayout>
	);
}
