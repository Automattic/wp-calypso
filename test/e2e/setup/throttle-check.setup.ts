import { THROTTLE_IDS, readActiveThrottles, throttleEnvVar } from '@automattic/calypso-e2e';
import { test as setup } from '@playwright/test';

/**
 * Publishes the throttles other builds have already hit.
 *
 * wpcom rate-limits signup and domain lookups per IP, and every build in the
 * project shares one, so a ban another build walked into minutes ago applies to
 * this run before it has sent a single request. Playwright carries env vars set
 * here into every test worker, so one lookup serves the whole build.
 *
 * A throttle that starts mid-run is not this check's problem: the worker that
 * hits it records it for itself and tags the build for everyone else.
 */
setup( 'check active wpcom throttles', async () => {
	const active = await readActiveThrottles();

	for ( const id of THROTTLE_IDS ) {
		const expiresAtMs = active[ id ];
		// Empty rather than absent, so a worker reads "checked, not throttled"
		// rather than "never checked".
		process.env[ throttleEnvVar( id ) ] = expiresAtMs ? String( expiresAtMs ) : '';

		if ( expiresAtMs ) {
			console.warn(
				`wpcom is throttling ${ id } until ${ new Date( expiresAtMs ).toISOString() }.`
			);
		}
	}
} );
