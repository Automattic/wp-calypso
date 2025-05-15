import { billingHistoryRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function BillingHistory() {
	return (
		<PageLayout size="small">
			<PageHeader title={ billingHistoryRoute.options.staticData.label() } />
			<div>Billing history content will go here</div>
		</PageLayout>
	);
}

export default BillingHistory;
