import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import NotificationsPageHeader from '../notifications-page-header';
import { PauseAllEmails } from './pause-all-emails';
import { SubscriptionSettings } from './subscription-settings';

export default function NotificationsEmails() {
	return (
		<PageLayout
			size="small"
			header={
				<NotificationsPageHeader
					title={ __( 'Emails' ) }
					description={ createInterpolateElement(
						__( 'To manage individual site subscriptions, <link>go to the Reader</link>.' ),
						{
							link: <a href="/reader/subscriptions" target="_blank" rel="noopener noreferrer" />,
						}
					) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<PauseAllEmails />
				<SubscriptionSettings />
			</VStack>
		</PageLayout>
	);
}
