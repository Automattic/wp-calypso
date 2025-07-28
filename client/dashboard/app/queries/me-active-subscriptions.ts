import { fetchActiveSubscriptionsForUser } from '../../data/me-active-subscriptions';

export const activeSubscriptionsQuery = ( { siteId }: { siteId?: string | number } ) => ( {
	queryKey: [ 'me', 'active-subscriptions', { siteId } ],
	queryFn: () => fetchActiveSubscriptionsForUser( { siteId } ),
} );
