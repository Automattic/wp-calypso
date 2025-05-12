import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function BillingHistory() {
	return (
		<PageLayout size="small">
			<PageHeader title={ __( 'Billing History' ) } level={ 1 } />
			<div>Billing history content will go here</div>
		</PageLayout>
	);
}

export default BillingHistory;
