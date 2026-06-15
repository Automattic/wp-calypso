import type { MyAccountInformationResponse, RestAPIClient } from '@automattic/calypso-e2e';

const POLL_INTERVAL = 1000;
const POLL_TIMEOUT = 30 * 1000;

// `RestAPIClient` surfaces API failures as `Error( '<code>: <message>' )`
// without the HTTP status, so transient failures are recognized by known
// message signatures instead. Anything else is rethrown immediately.
const TRANSIENT_ERROR_PATTERNS = [
	/invalid_token/, // Token minted at signup not yet accepted (read-after-write lag).
	/internal_server_error/,
	/service_unavailable/,
	/Failed to parse JSON/, // Non-JSON 5xx body, e.g. an HTML error page from an intermediary.
	/fetch failed/, // Network-level failure.
];

/**
 * Checks whether an error thrown while calling the API looks transient.
 *
 * @param {unknown} error Error thrown by `RestAPIClient`.
 * @returns {boolean} Whether the call is worth retrying.
 */
function isTransientError( error: unknown ): boolean {
	const message = error instanceof Error ? error.message : String( error );
	return TRANSIENT_ERROR_PATTERNS.some( ( pattern ) => pattern.test( message ) );
}

/**
 * Polls the read-only `/me` endpoint until `until` holds for its response,
 * absorbing transient errors along the way.
 *
 * Implemented as a plain loop rather than `expect.poll`: this module is
 * re-exported by the shared barrel, which legacy Jest specs also import,
 * so it must not depend on `@playwright/test`.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {Function} until Predicate evaluated against each successful response.
 * @param {string} timeoutMessage Error message used when the timeout elapses.
 * @throws If a non-transient error occurs, or the timeout elapses.
 */
async function pollMyAccountInformation(
	client: RestAPIClient,
	until: ( me: MyAccountInformationResponse ) => boolean,
	timeoutMessage: string
): Promise< void > {
	const deadline = Date.now() + POLL_TIMEOUT;
	let lastError: unknown = null;
	while ( true ) {
		try {
			if ( until( await client.getMyAccountInformation() ) ) {
				return;
			}
			// The call succeeded; the awaited flag has just not flipped yet.
			lastError = null;
		} catch ( error ) {
			if ( ! isTransientError( error ) ) {
				throw error;
			}
			lastError = error;
		}
		if ( Date.now() + POLL_INTERVAL > deadline ) {
			break;
		}
		await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL ) );
	}
	throw new Error( lastError ? `${ timeoutMessage } Last error: ${ lastError }` : timeoutMessage );
}

/**
 * Waits until the API accepts the client's bearer token.
 *
 * The bearer token minted by the signup flow is not always accepted by the
 * API immediately (observed as `invalid_token` on the first authenticated
 * call in CI). Polls a read-only endpoint until the token is honoured so
 * that subsequent mutating calls (e.g. `createSite`) stay single-shot and
 * cannot leak a site.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {string} email Email of the user the token belongs to, for error reporting.
 * @throws If the token is still rejected when the timeout elapses.
 */
export async function apiWaitForBearerTokenAcceptance(
	client: RestAPIClient,
	email: string
): Promise< void > {
	await pollMyAccountInformation(
		client,
		() => true,
		`Bearer token for ${ email } was not accepted by the API after signup.`
	);
}

/**
 * Waits until the user's email reads as verified.
 *
 * Account activation is processed asynchronously on the backend: the
 * activation-link redirect can land before `email_verified` is readable by
 * later requests, and specs depend on a verified user (e.g. My Home hides
 * the domain-upsell card for unverified users).
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {string} email Email of the user being verified, for error reporting.
 * @throws If the flag is still unset when the timeout elapses.
 */
export async function apiWaitForEmailVerification(
	client: RestAPIClient,
	email: string
): Promise< void > {
	await pollMyAccountInformation(
		client,
		( me ) => me.email_verified === true,
		`Email verification for ${ email } did not propagate after visiting the activation link.`
	);
}
