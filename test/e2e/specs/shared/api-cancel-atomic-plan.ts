import type { RestAPIClient } from '@automattic/calypso-e2e';

/**
 * Cancels the Business-plan purchase for the authenticated test user (see
 * `RestAPIClient.cancelAtomicPlan`), triggering Atomic-site deprovision so
 * `apiCloseAccount` can later close the account.
 *
 * Runs in `afterAll`, so it never throws: on any failure it warns and returns,
 * degrading to the prior leak-marker behavior.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {number|string} [siteId] Restrict cancellation to this site's Business plan.
 */
export async function apiCancelAtomicPlan(
	client: RestAPIClient,
	siteId?: number | string
): Promise< void > {
	try {
		await client.cancelAtomicPlan( siteId );
	} catch ( error ) {
		console.warn( `Error cancelling Atomic plan (continuing to account close): ${ error }` );
	}
}
