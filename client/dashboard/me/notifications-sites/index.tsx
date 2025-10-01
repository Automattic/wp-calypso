import { notificationPushPermissionStateQuery } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { isRTL, __ } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { BrowserNotificationCard } from './browser-notification-card';
import { BrowserNotificationNotice } from './browser-notification-notice';

export default function NotificationsSites() {
	const { data: status } = useQuery( notificationPushPermissionStateQuery() );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={
						<RouterLinkButton
							className="dashboard-page-header__back-button"
							icon={ isRTL() ? chevronRight : chevronLeft }
							to="/me/notifications"
						>
							{ __( 'Back' ) }
						</RouterLinkButton>
					}
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
