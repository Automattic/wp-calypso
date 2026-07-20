import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { RestAPIClient } from './rest-api-client';
import type { AccountClosureResponse, AccountDetails } from './types';

const MAX_ERROR_LENGTH = 300;

// An account with an active Atomic site cannot be closed. Cancelling the plan
// (done by the spec) deprovisions the site asynchronously, so the close keeps
// returning `atomic-site` until that completes (~80s in CI). Retry over this
// window before treating the failure as a leak; the margin absorbs variance.
const ATOMIC_DEPROVISION_TIMEOUT_MS = 180 * 1000;
const ATOMIC_DEPROVISION_POLL_MS = 15 * 1000;

export interface AccountLeak {
	/**
	 * Numeric user ID; absent when a signup response created an account but did
	 * not return its ID. Markers then fall back to keying on the email.
	 */
	userID?: number;
	username: string;
	email: string;
	/** Optional blog URLs the caller tracked, surfaced in the marker for richer evidence. */
	blogs?: string[];
	/** The error that caused the leak; reduced to its message in the marker. */
	error?: unknown;
}

/**
 * Absolute path of the marker file for a given account inside `leakDir`. Keyed
 * by user ID when known, otherwise by a filesystem-safe form of the email so an
 * account created without a returned ID is still recorded.
 *
 * @param {string} leakDir Directory where markers are written.
 * @param {number|string} key The user ID, or an email/identifier fallback.
 * @returns {string} Absolute marker file path.
 */
function markerPath( leakDir: string, key: number | string ): string {
	// `encodeURIComponent` is injective, so distinct emails never collide on the
	// same marker file (a plain character-class replacement would collapse e.g.
	// `+` and `@` to `_` and let two accounts overwrite each other).
	const safeKey = typeof key === 'number' ? String( key ) : encodeURIComponent( key );
	return path.join( leakDir, `account-${ safeKey }.json` );
}

/**
 * Reduces an unknown error to a short, single-line message safe to embed in a
 * marker. Plain objects (e.g. a `{ success: false, … }` close response) are
 * JSON-serialized so the CI artifact says why the close failed rather than the
 * useless `"[object Object]"` that `String()` would produce.
 *
 * @param {unknown} error The error value.
 * @returns {string} A bounded message string.
 */
function errorMessage( error: unknown ): string {
	let message: string;
	if ( error instanceof Error ) {
		message = error.message;
	} else if ( error && typeof error === 'object' ) {
		// `JSON.stringify` returns `undefined` (not `"undefined"`) when the value
		// serializes to nothing, e.g. a custom `toJSON()` returning undefined; fall
		// back to `String()` so `.slice` below never throws.
		let serialized: string | undefined;
		try {
			serialized = JSON.stringify( error );
		} catch {
			serialized = undefined;
		}
		message = serialized !== undefined ? serialized : String( error );
	} else {
		message = String( error ?? '' );
	}
	return message.slice( 0, MAX_ERROR_LENGTH );
}

/**
 * Whether a failed account close was rejected because the account still owns an
 * active Atomic site (WordPress.com error code `atomic-site`). `closeAccount`
 * returns the raw API response, so the code arrives as `{ error: 'atomic-site' }`;
 * the serialized-message fallback covers a thrown error carrying the same code.
 *
 * @param {unknown} error The close error or response value.
 * @returns {boolean} True when the close was blocked by an active Atomic site.
 */
function isActiveAtomicSiteError( error: unknown ): boolean {
	if (
		error &&
		typeof error === 'object' &&
		( error as { error?: unknown } ).error === 'atomic-site'
	) {
		return true;
	}
	return /atomic-site|active atomic sites/i.test( errorMessage( error ) );
}

/**
 * Whether an error from a `/me` request indicates the account is gone (a dead or
 * invalid bearer token), as opposed to a transient/network/server error.
 *
 * Used to decide, after a failed account close, whether a surviving leak marker
 * should be cleared (account already closed) or kept (state unknown -> assume leak).
 * Errors thrown by `RestAPIClient.getMyAccountInformation` are `Error`s whose
 * message is `"<code>: <message>"` (e.g. `"invalid_token: …"`).
 *
 * Assumption: an auth error here means the account was closed. This is not
 * provable in general - a revoked or expired token on a still-open account would
 * be misclassified as closed, clearing a real leak. It holds in practice because
 * the accounts torn down here are created within the same test and live for
 * minutes: the bearer token is long-lived relative to that window, so a token
 * going dead mid-test for any reason other than the account being closed (e.g.
 * the in-body UI close, which is exactly the no-leak case) is unlikely.
 *
 * @param {unknown} error The error value.
 * @returns {boolean} True only for a confirmed dead-token / unauthorized error.
 */
export function isAccountClosedError( error: unknown ): boolean {
	const message = error instanceof Error ? error.message : String( error ?? '' );
	// `invalid_username` is included because it means the account never existed
	// (a rejected/throttled signup, surfaced via the bearer-token login fallback),
	// so like the auth codes above it is a "nothing to leak" signal, not a bug.
	return /invalid_token|authorization_required|unauthorized|user_not_found|invalid_username/i.test(
		message
	);
}

/**
 * Records a teardown leak for an account that could not be closed.
 *
 * Writes one whole file per user under `leakDir`. Distinct user IDs map to
 * distinct files, so concurrent Playwright workers never contend. Never throws.
 *
 * @param {string} leakDir Directory where markers are written.
 * @param {AccountLeak} leak Details of the leaked account.
 */
export function recordAccountLeak( leakDir: string, leak: AccountLeak ): void {
	const key = leak.userID || leak.email;
	try {
		mkdirSync( leakDir, { recursive: true } );
		const payload = {
			...( leak.userID ? { userID: leak.userID } : {} ),
			username: leak.username,
			email: leak.email,
			...( leak.blogs && leak.blogs.length ? { blogs: leak.blogs } : {} ),
			error: errorMessage( leak.error ),
		};
		writeFileSync( markerPath( leakDir, key ), JSON.stringify( payload ) + '\n' );
	} catch ( error ) {
		console.warn( `Failed to record teardown leak marker for account ${ key }: ${ error }` );
	}
}

/**
 * Clears the teardown leak marker for an account that was successfully closed
 * (or confirmed already gone). Idempotent and never throws.
 *
 * @param {string} leakDir Directory where markers are written.
 * @param {number} userID The user ID.
 */
export function clearAccountLeak( leakDir: string, userID: number ): void {
	try {
		rmSync( markerPath( leakDir, userID ), { force: true } );
	} catch ( error ) {
		console.warn( `Failed to clear teardown leak marker for user ${ userID }: ${ error }` );
	}
}

/**
 * Closes a test account and maintains its teardown leak marker as CI evidence.
 *
 * Records a marker only when the account is confirmed to still exist after a
 * close that did not succeed: it probes `getMyAccountInformation` (which throws
 * on a dead token). A confirmed dead-token error means the account is already
 * gone (e.g. closed via the UI earlier in the test) -> not a leak, clear the
 * marker. Any other probe failure is treated conservatively as a possible leak
 * (recorded), so a transient error never silently drops a real leak. Never throws,
 * so it is safe to call from an `afterAll`.
 *
 * @param {RestAPIClient} client REST API client authenticated as the account.
 * @param {AccountDetails} accountDetails Identity of the account to close.
 * @param {string} leakDir Directory where leak markers are written.
 */
export async function closeAccountAndRecordLeak(
	client: RestAPIClient,
	accountDetails: AccountDetails,
	leakDir: string
): Promise< void > {
	const hasUserID = Number.isInteger( accountDetails.userID ) && accountDetails.userID > 0;
	const username =
		typeof accountDetails.username === 'string' ? accountDetails.username.trim() : '';
	const email = typeof accountDetails.email === 'string' ? accountDetails.email.trim() : '';

	if ( ! hasUserID || ! username || ! email ) {
		console.warn( 'Skipping remote account teardown: account identity is incomplete.' );
		if ( hasUserID || email ) {
			recordAccountLeak( leakDir, {
				...( hasUserID ? { userID: accountDetails.userID } : {} ),
				username,
				email,
				error:
					'Remote teardown skipped because the signup response contained an incomplete account identity.',
			} );
		}
		return;
	}

	console.log( `Closing account ${ accountDetails.userID }.` );

	// Track the wait so the terminal `[atomic-teardown]` breadcrumb reports how
	// long the Atomic deprovision took, surfacing drift if that timing changes.
	const startedAt = Date.now();
	const deadline = startedAt + ATOMIC_DEPROVISION_TIMEOUT_MS;
	let closeError: unknown;
	let attempts = 0;
	let sawAtomicSite = false;
	for (;;) {
		closeError = undefined;
		attempts += 1;
		try {
			const response: AccountClosureResponse = await client.closeAccount( accountDetails );

			if ( response.success === true ) {
				if ( sawAtomicSite ) {
					console.log(
						`[atomic-teardown] user ${
							accountDetails.userID
						} closed after ${ attempts } attempt(s) over ${
							Date.now() - startedAt
						}ms of Atomic deprovision wait.`
					);
				}
				console.log( `Successfully deleted user ID ${ accountDetails.userID }` );
				clearAccountLeak( leakDir, accountDetails.userID );
				return;
			}

			console.warn( `Failed to delete user ID ${ accountDetails.userID }` );
			console.warn( response );
			closeError = response;
		} catch ( error ) {
			console.warn( `Error closing account ${ accountDetails.userID }: ${ error }` );
			closeError = error;
		}

		// Only an active-Atomic-site rejection is worth waiting on; every other
		// failure is terminal and falls through to the leak probe immediately.
		if ( ! isActiveAtomicSiteError( closeError ) || Date.now() >= deadline ) {
			break;
		}
		sawAtomicSite = true;
		await new Promise( ( resolve ) => setTimeout( resolve, ATOMIC_DEPROVISION_POLL_MS ) );
	}

	if ( sawAtomicSite ) {
		console.log(
			`[atomic-teardown] user ${
				accountDetails.userID
			} still blocked by an Atomic site after ${ attempts } attempt(s) over ${
				Date.now() - startedAt
			}ms; recording leak.`
		);
	}

	try {
		await client.getMyAccountInformation();
		// Account still exists and we failed to close it: a real leak.
		recordAccountLeak( leakDir, { ...accountDetails, error: closeError } );
	} catch ( probeError ) {
		if ( isAccountClosedError( probeError ) ) {
			// Dead token: the account is already gone. Not a leak.
			clearAccountLeak( leakDir, accountDetails.userID );
		} else {
			// Could not confirm the account is gone (transient/network error).
			// Be conservative and record so the CI check does not miss a real leak.
			recordAccountLeak( leakDir, { ...accountDetails, error: closeError } );
		}
	}
}
