import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { claimGateConfirmation } from './storage';

/**
 * Records the confirmation for an attempt, if this caller is the one that claims it.
 *
 * Both the gate and the account step can be the one to notice — the gate while it's mounted, the
 * step when `/me` already read verified on arrival — and several tabs can notice at once.
 */
export function recordGateConfirmation( scope: string, flow: string ): void {
	const claim = claimGateConfirmation( scope );
	if ( claim ) {
		recordTracksEvent( 'calypso_signup_email_verification_confirmed', {
			flow,
			seconds_on_step: claim.secondsOnStep,
		} );
	}
}
