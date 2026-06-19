import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { RestAPIClient } from './rest-api-client';
import type { AccountClosureResponse, AccountDetails } from './types';

const MAX_ERROR_LENGTH = 300;

export interface AccountLeak {
	userID: number;
	username: string;
	email: string;
	/** Optional blog URLs the caller tracked, surfaced in the marker for richer evidence. */
	blogs?: string[];
	/** The error that caused the leak; reduced to its message in the marker. */
	error?: unknown;
}

/**
 * Absolute path of the marker file for a given user inside `leakDir`.
 *
 * @param {string} leakDir Directory where markers are written.
 * @param {number} userID The user ID.
 * @returns {string} Absolute marker file path.
 */
function markerPath( leakDir: string, userID: number ): string {
	return path.join( leakDir, `account-${ userID }.json` );
}

/**
 * Reduces an unknown error to a short, single-line message safe to embed in a marker.
 *
 * @param {unknown} error The error value.
 * @returns {string} A bounded message string.
 */
function errorMessage( error: unknown ): string {
	const message = error instanceof Error ? error.message : String( error ?? '' );
	return message.slice( 0, MAX_ERROR_LENGTH );
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
 * @param {unknown} error The error value.
 * @returns {boolean} True only for a confirmed dead-token / unauthorized error.
 */
export function isAccountClosedError( error: unknown ): boolean {
	const message = error instanceof Error ? error.message : String( error ?? '' );
	return /invalid_token|authorization_required|unauthorized|user_not_found/i.test( message );
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
	try {
		mkdirSync( leakDir, { recursive: true } );
		const payload = {
			userID: leak.userID,
			username: leak.username,
			email: leak.email,
			...( leak.blogs && leak.blogs.length ? { blogs: leak.blogs } : {} ),
			error: errorMessage( leak.error ),
		};
		writeFileSync( markerPath( leakDir, leak.userID ), JSON.stringify( payload ) + '\n' );
	} catch ( error ) {
		console.warn( `Failed to record teardown leak marker for user ${ leak.userID }: ${ error }` );
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
	console.log( `Closing account ${ accountDetails.userID }.` );

	let closeError: unknown;
	try {
		const response: AccountClosureResponse = await client.closeAccount( accountDetails );

		if ( response.success === true ) {
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
