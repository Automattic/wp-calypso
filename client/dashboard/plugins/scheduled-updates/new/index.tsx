import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function NewSchedule() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'New schedule' ) } /> }>
			{ /* Scaffold - sections will be implemented in follow-up PR */ }
		</PageLayout>
	);
}
