import { activeSubscriptionsRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function ActiveSubscriptions() {
	return (
		<PageLayout size="small">
			<PageHeader title={ activeSubscriptionsRoute.options.staticData.label() } />
			<div>Active subscriptions content will go here</div>
		</PageLayout>
	);
}
