/**
 * The retired `/start/hosting` flow redirects to `/start/hosting-start`, the hosting landing
 * page's flow. Both run the same steps, so the rest of the path and the query carry over.
 */
export const LEGACY_HOSTING_FLOW = 'hosting';

/**
 * The same URL in the `hosting-start` flow.
 * @param url Path and query of a `/start/hosting` URL.
 */
export function getLegacyHostingFlowRedirect( url: string ): string {
	return url.replace( /^\/start\/hosting(?=[/?]|$)/, '/start/hosting-start' );
}
