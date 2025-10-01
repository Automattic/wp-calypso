import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { PauseAllEmails } from './pause-all-emails';
import { SubscriptionSettings } from './subscription-settings';

export default function NotificationsEmails() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Emails' ) }
					prefix={
						<RouterLinkButton
							className="dashboard-page-header__back-button"
							icon={ isRTL() ? chevronRight : chevronLeft }
							to="/me/notifications"
						>
							{ __( 'Back' ) }
						</RouterLinkButton>
					}
					description={ createInterpolateElement(
						__( 'To manage individual site subscriptions, <link>go to the Reader</link>.' ),
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
