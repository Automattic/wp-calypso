import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

function BillingHistory() {
	return (
		<PageLayout title={ __( 'Billing History' ) } size="small">
			<div>Billing history content will go here</div>
		</PageLayout>
	);
}

export default BillingHistory;
