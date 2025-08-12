import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function TaxDetails() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Tax Details' ) } /> }>
			<div>Tax details content will go here</div>
		</PageLayout>
	);
}
