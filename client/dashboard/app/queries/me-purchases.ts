import { queryOptions } from '@tanstack/react-query';
import { fetchPurchasesForUser } from '../../data/me-purchases';

export const purchasesQuery = ( { siteId }: { siteId?: string | number } ) =>
	queryOptions( {
		queryKey: [ 'me', 'active-subscriptions', { siteId } ],
		queryFn: () => fetchPurchasesForUser( { siteId } ),
	} );
