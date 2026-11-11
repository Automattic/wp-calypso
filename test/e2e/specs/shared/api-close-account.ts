import path from 'node:path';
import { closeAccountAndRecordLeak, recordAccountLeak } from '@automattic/calypso-e2e';
import type { AccountDetails, AccountLeak, RestAPIClient } from '@automattic/calypso-e2e';

// Teardown leak markers live under the published, gitignored e2e output dir.
// Playwright transpiles TS in place, so `__dirname` is the source dir:
// `test/e2e/specs/shared` -> `test/e2e/output/teardown-leaks`.
export const LEAK_DIR = path.resolve( __dirname, '..', '..', 'output', 'teardown-leaks' );

// Deferred closes carry a bearer token, so they must stay out of `output/`:
// CI publishes that whole directory as build artifacts.
export const PENDING_CLOSE_DIR = path.resolve( __dirname, '..', '..', '.teardown-pending' );

/**
 * Makes an API request to close the user account, maintaining a teardown leak
 * marker as CI evidence.
 *
 * Closing an account also closes any sites belonging to the user, so it is not
 * required to delete sites first. A marker is recorded only when a close that
 * did not succeed is followed by confirmation that the account still exists, so
 * calling this on an already-closed account (e.g. one closed via the UI) is a
 * safe no-op. Never throws. See `closeAccountAndRecordLeak` for the full logic.
 *
 * An account whose Atomic site is still deprovisioning is deferred to the
 * end-of-run reaper (see the `globalTeardown`) instead of being waited on here.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {AccountDetails} accountDetails Details of the account to close.
 */
export async function apiCloseAccount(
	client: RestAPIClient,
	accountDetails: AccountDetails
): Promise< void > {
	await closeAccountAndRecordLeak( client, accountDetails, LEAK_DIR, PENDING_CLOSE_DIR );
}

/**
 * Records a teardown leak marker under the shared e2e output dir for an account
 * that cannot be closed by ID (e.g. signup created the account but returned no
 * user ID), so CI still surfaces the leak. Keyed by email when the ID is absent.
 * Never throws.
 *
 * @param {AccountLeak} leak Details of the leaked account.
 */
export function recordAccountLeakMarker( leak: AccountLeak ): void {
	recordAccountLeak( LEAK_DIR, leak );
}
