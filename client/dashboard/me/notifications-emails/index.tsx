import { __experimentalVStack as VStack, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { PauseAllEmails } from './pause-all-emails';
import { SubscriptionSettings } from './subscription-settings';

export default function NotificationsEmails() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Emails' ) }
					description={ createInterpolateElement(
						__( 'To manage individual site subscriptions, <link>go to the Reader</link>.' ),
						{
							link: <ExternalLink href="/reader/subscriptions" children={ null } />,
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
