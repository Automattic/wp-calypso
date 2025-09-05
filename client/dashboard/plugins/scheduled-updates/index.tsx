import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function PluginsScheduledUpdates() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Scheduled updates' ) } /> }>
			{ /* TODO: Implement schedule updates UI */ }
		</PageLayout>
	);
}
