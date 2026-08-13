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

// Comfortably under the 120s test timeout, and clear of what the lookup's own
// bounds add up to: 5s of tag lookups, then a 20s log budget which a read already
// begun may overrun by its own 20s. A deadline set at that sum would fire on the
// answer rather than after it. The margin matters both ways: every project in the
// suite depends on this one, so a test Playwright times out from the outside
// costs the whole run.
const CHECK_TIMEOUT = 60 * 1000;

setup( 'check active wpcom throttles', async () => {
	let active: Partial< Record< ThrottleId, number | null > > | null = null;

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

	// Nothing published when the lookup failed: an empty variable is this project
	// saying it looked and found nothing, and a run that could not look must not
	// be able to say that.
	if ( ! active ) {
		return;
	}

	for ( const id of THROTTLE_IDS ) {
		const expiresAtMs = active[ id ];
		// An id the lookup could not answer for is left unset, which is a worker
		// reading "never checked". Publishing the empty string for it would be this
		// project saying it looked, which is the one thing it must not say when a
		// build it could not read may be sitting in a ban right now.
		if ( expiresAtMs === undefined ) {
			continue;
		}
		// Empty rather than absent, so a worker reads "checked, not throttled"
		// rather than "never checked".
		process.env[ throttleEnvVar( id ) ] = expiresAtMs ? String( expiresAtMs ) : '';

		if ( expiresAtMs ) {
			// Not "wpcom is throttling": this is where another build's log said its
			// ban reached, and that build may have been refused again since and
			// pushed its own expiry out past this one.
			console.warn(
				`Another build hit the ${ id } throttle; treating it as in force until ${ new Date(
					expiresAtMs
				).toISOString() }.`
			);
		}
	}
} );
