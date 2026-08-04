import config from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

// `pending` is not a kind of `clear`: the current user's ID survives a reload but the user object
// does not, so there is a window where the account is logged in and nothing is known about it.
// Reading the absent fields as an unverified email would open the gate onto a blank address, with
// no answer to give and nothing to resend.
type GateStatus = 'pending' | 'clear' | 'gated';

interface EmailVerificationGate {
	// The feature is on for this flow, whoever the user turns out to be. Account creation needs
	// this before `/me` has answered anything.
	isEnabled: boolean;
	status: GateStatus;
}

/**
 * Whether the account step should hold this user on the email verification gate.
 *
 * `/me` decides it, so the answer holds in any tab or session rather than only the one that signed
 * up. Email registrations are the whole of what it reaches: social accounts are created already
 * verified, and a phone account carries a generated address it hasn't replaced yet — unverified
 * for a reason this screen has no answer for, since there's no link sitting in an inbox to click.
 *
 * This opens the gate; it doesn't close it. The gate owns the confirmation once it's up — see the
 * latch in the account step.
 *
 * The experiment arm joins this expression once the experiment exists. It belongs here rather than
 * in `/me` so that enrolment happens where the user actually meets the gate.
 */
export function useEmailVerificationGate( flow: string ): EmailVerificationGate {
	const currentUser = useSelector( getCurrentUser );

	const isEnabled = config.isEnabled( 'onboarding/email-verification' ) && flow === ONBOARDING_FLOW;

	let status: GateStatus = 'clear';
	if ( isEnabled ) {
		if ( ! currentUser ) {
			status = 'pending';
		} else if ( ! currentUser.email_verified && ! currentUser.phone_account ) {
			status = 'gated';
		}
	}

	return { isEnabled, status };
}
