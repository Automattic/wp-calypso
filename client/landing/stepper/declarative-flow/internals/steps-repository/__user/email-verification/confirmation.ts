import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { claimGateConfirmation } from './storage';

/**
 * Records the confirmation for an attempt, if this caller is the one that claims it. Several tabs
 * can notice the same confirmation at once; only one of them should count it.
 */
export async function recordGateConfirmation( scope: string, flow: string ): Promise< void > {
	const claim = await claimGateConfirmation( scope );
	if ( claim ) {
		recordTracksEvent( 'calypso_signup_email_verification_confirmed', {
			flow,
			seconds_on_step: claim.secondsOnStep,
		} );
	}
}
