import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { activeSubscriptionsQuery } from '../../app/queries/me-active-subscriptions';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function ActiveSubscriptions() {
	const { data: activeSubscriptions } = useQuery( activeSubscriptionsQuery() );

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Active Subscriptions' ) } /> }>
			<div>Active subscriptions content will go here</div>
			<ul>
				{ activeSubscriptions?.map( ( subscription ) => {
					return <li key={ subscription.ID }>{ subscription.product_name }</li>;
				} ) }
			</ul>
		</PageLayout>
	);
}
