import { THROTTLE_IDS, readActiveThrottles, throttleEnvVar } from '@automattic/calypso-e2e';
import { test as setup } from '@playwright/test';
import { withDeadline } from '../lib/with-deadline';
import type { ThrottleId } from '@automattic/calypso-e2e';

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

// Comfortably under the 120s test timeout, and over what the lookup's own
// bounds add up to.
const CHECK_TIMEOUT = 90 * 1000;

setup( 'check active wpcom throttles', async () => {
	let active: Partial< Record< ThrottleId, number | null > > = {};

	// The requests the lookup makes are bounded one by one, but their sum plus a
	// worker's startup is close enough to the 120s test timeout to be worth a
	// deadline of its own. Whatever comes out is reported and dropped: a setup
	// project that ends with a failing test makes Playwright skip every project
	// that depends on it, which would cost the whole run to save an advisory
	// lookup.
	try {
		active = await withDeadline( readActiveThrottles(), CHECK_TIMEOUT );
	} catch ( error ) {
		console.warn( `Could not read the throttles other builds hit: ${ error }` );
	}

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
