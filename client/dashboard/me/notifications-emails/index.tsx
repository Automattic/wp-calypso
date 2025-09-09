import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function NotificationsEmails() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Emails' ) }
					description={ createInterpolateElement(
						__( 'To manage individual site subscriptions, <link>go to the Reader</link>.' ),
						{
							link: <a href="/reader/subscriptions" target="_blank" rel="noopener noreferrer" />,
						}
					) }
				/>
			}
		></PageLayout>
	);
}
