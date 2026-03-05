import { RestAPIClient } from '@automattic/calypso-e2e';

/**
 * Cancels all active purchases for a site via the REST API.
 *
 * This must be called before `apiDeleteSite` for any site that has an active
 * paid subscription, otherwise the delete request will be rejected with a 403.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {number} siteID ID of the site whose purchases should be cancelled.
 */
export async function apiCancelSitePurchases(
	client: RestAPIClient,
	siteID: number
): Promise< void > {
	console.info( `Fetching purchases for siteID ${ siteID }` );

	const { purchases } = await client.getSitePurchases( siteID );

	if ( ! purchases || purchases.length === 0 ) {
		console.info( `No purchases found for siteID ${ siteID }` );
		return;
	}

	for ( const purchase of purchases ) {
		console.info( `Cancelling purchase ${ purchase.ID } (${ purchase.product_name })` );
		await client.cancelPurchase( purchase.ID );
		console.info( `Cancelled purchase ${ purchase.ID }` );
	}
}
