import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function NotificationsEmails() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Extras' ) }
					description={ __(
						'Get curated extras like reports, digests, and community updates, so you can stay tuned for what’s happening in the WordPress ecosystem.'
					) }
				/>
			}
		></PageLayout>
	);
}
