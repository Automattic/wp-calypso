import { queryOptions } from '@tanstack/react-query';
import { fetchActiveSubscriptionsForUser } from '../../data/me-active-subscriptions';

export const activeSubscriptionsQuery = ( { siteId }: { siteId?: string | number } ) =>
	queryOptions( {
		queryKey: [ 'me', 'active-subscriptions', { siteId } ],
		queryFn: () => fetchActiveSubscriptionsForUser( { siteId } ),
	} );
