import { paymentMethodsRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function PaymentMethods() {
	return (
		<PageLayout size="small">
			<PageHeader title={ paymentMethodsRoute.options.staticData.label() } />
			<div>Payment methods content will go here</div>
		</PageLayout>
	);
}
