import { __ } from '@wordpress/i18n';
import { monetizeSubscriptionRoute } from '../../app/router/me';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function MonetizeSubscription() {
	const params = monetizeSubscriptionRoute.useParams();
	const subscriptionId = params.subscriptionId;

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Monetize subscription' ) } /> }>
			<div>{ subscriptionId }</div>
		</PageLayout>
	);
}
