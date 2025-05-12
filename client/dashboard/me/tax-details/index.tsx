import { PageHeader } from '@automattic/components/src/page-header';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

export default function TaxDetails() {
	return (
		<PageLayout size="small">
			<PageHeader title={ __( 'Tax Details' ) } level={ 1 } />
			<div>Tax details content will go here</div>
		</PageLayout>
	);
}
