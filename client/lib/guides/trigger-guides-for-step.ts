import wpcom from 'calypso/lib/wp';

/**
 * In-memory cache to prevent duplicate requests.
 * Users can go through a flow multiple times, and this will be reset on a page reload.
 */
const previousRequests = new Set< string >();

// trigger guides on step movement, we don't care about failures or response
// modify the function to include siteSlug and siteId as optional
export function triggerGuidesForStep(
	flowName: string,
	stepName?: string,
	siteSlug?: string,
	siteId?: number
) {
	const key =
		flowName +
		':' +
		( stepName || '' ) +
		':' +
		( siteSlug || 'no-site' ) +
		':' +
		( siteId || 'no-id' );
	if ( previousRequests.has( key ) ) {
		return;
	}
	previousRequests.add( key );
	wpcom.req
		.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: stepName,
				siteSlug: siteSlug,
				siteId: siteId,
			}
		)
		.then()
		.catch();
}
