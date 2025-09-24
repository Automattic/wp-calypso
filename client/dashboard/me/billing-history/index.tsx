import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import BillingPageHeader from '../billing-page-header';

function BillingHistory() {
	return (
		<PageLayout size="small" header={ <BillingPageHeader title={ __( 'Billing history' ) } /> }>
			<div>Billing history content will go here</div>
		</PageLayout>
	);
}

export default BillingHistory;
