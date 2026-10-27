import { queryClient, userPurchasesQuery } from '@automattic/api-queries';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { navigate } from 'calypso/lib/navigate';

/**
 * Account-level purchase management lives in the Dashboard; the classic pages
 * only remain as redirects so that old links keep working.
 * @param {string|Function} path Dashboard path, or a function of the route params that returns one.
 * @returns {Function} A page.js handler.
 */
export const redirectToMultiSiteDashboard = ( path ) => ( context ) =>
	navigate( dashboardLink( typeof path === 'function' ? path( context.params ) : path ) );

/**
 * The Dashboard addresses purchases by ID, so resolve the ownership ID first.
 */
export async function redirectPurchaseByOwnershipToDashboard( context ) {
	const ownershipId = parseInt( context.params.ownershipId, 10 );
	const purchases = await queryClient.fetchQuery( userPurchasesQuery() ).catch( () => undefined );
	const purchase = purchases?.find( ( item ) => item.ownership_id === ownershipId );

	navigate(
		dashboardLink( purchase ? `/me/billing/purchases/${ purchase.ID }` : '/me/billing/purchases' )
	);
}
