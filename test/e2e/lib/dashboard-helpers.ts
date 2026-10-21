import type { RestAPIClient } from '@automattic/calypso-e2e';

/**
 * Snoozes the account-recovery interstitial for the given user.
 *
 * The interstitial is an app-level modal that mounts over every dashboard route
 * for users with incomplete account-recovery setup. It traps focus and blocks
 * the UI the dashboard specs interact with (and adds its own heading to the
 * page). Persisting a far-future snooze keeps it from rendering, matching the
 * `account-recovery-interstitial-snoozed-until` preference the dashboard reads
 * (a unix timestamp, in seconds).
 *
 * @param client - REST API client authenticated as the user to snooze.
 */
export async function snoozeAccountRecoveryInterstitial( client: RestAPIClient ): Promise< void > {
	const tenYearsFromNowInSeconds = Math.floor( Date.now() / 1000 ) + 10 * 365 * 24 * 60 * 60;
	await client.setCalypsoPreferences( {
		'account-recovery-interstitial-snoozed-until': tenYearsFromNowInSeconds,
	} );
}
