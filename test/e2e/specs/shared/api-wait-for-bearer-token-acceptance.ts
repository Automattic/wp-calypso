import type { RestAPIClient } from '@automattic/calypso-e2e';

const POLL_INTERVAL = 1000;
const POLL_TIMEOUT = 30 * 1000;

/**
 * Waits until the API accepts the client's bearer token.
 *
 * The bearer token minted by the signup flow is not always accepted by the
 * API immediately (observed as `invalid_token` on the first authenticated
 * call in CI). Polls a read-only endpoint until the token is honoured so
 * that subsequent mutating calls (e.g. `createSite`) stay single-shot and
 * cannot leak a site.
 *
 * Implemented as a plain loop rather than `expect.poll`: this module is
 * re-exported by the shared barrel, which legacy Jest specs also import,
 * so it must not depend on `@playwright/test`.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {string} email Email of the user the token belongs to, for error reporting.
 * @throws If the token is still rejected when the timeout elapses.
 */
export async function apiWaitForBearerTokenAcceptance(
	client: RestAPIClient,
	email: string
): Promise< void > {
	const deadline = Date.now() + POLL_TIMEOUT;
	let lastError: unknown;
	while ( Date.now() <= deadline ) {
		try {
			await client.getMyAccountInformation();
			return;
		} catch ( error ) {
			lastError = error;
			await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL ) );
		}
	}
	throw new Error(
		`Bearer token for ${ email } was not accepted by the API after signup: ${ lastError }`
	);
}
