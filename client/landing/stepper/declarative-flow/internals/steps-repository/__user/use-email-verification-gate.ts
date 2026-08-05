import config from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

// Tells the backend to send an activation email whose link returns here rather than to the usual
// destination, so a gated user lands back on the flow they are being held in. The backend matches
// on the exact string; changing it here without changing it there drops them somewhere else.
export const ACTIVATION_EMAIL_SOURCE = 'onboarding-with-email-verification';

// `pending` is not a kind of `clear`: the user's ID survives a reload but the user object does
// not, so there is a window where the account is logged in and nothing is known about it. Reading
// those absent fields as an unverified email opens the gate onto a blank address.
//
// `verified` is not a kind of `clear` either. Only `/me` saying so means an attempt was actually
// confirmed; `clear` also covers the flag being off, which is not the same thing at all.
type GateStatus = 'pending' | 'clear' | 'verified' | 'gated';

interface EmailVerificationGate {
	// Account creation needs this before `/me` has answered anything.
	isEnabled: boolean;
	status: GateStatus;
}

/**
 * Whether the account step should hold this user on the email verification gate.
 *
 * Email registrations are the whole of what this reaches. Social accounts are created already
 * verified, and a phone account's address was generated for it — unverified for a reason the gate
 * has no answer for, since there's no link sitting in an inbox to click.
 *
 * This opens the gate and closes it: the account step renders the gate while `gated`, and finishes
 * the attempt when this turns `verified`.
 *
 * The experiment arm joins this expression once the experiment exists, rather than `/me`, so that
 * enrolment happens where the user meets the gate.
 */
export function useEmailVerificationGate( flow: string ): EmailVerificationGate {
	const currentUser = useSelector( getCurrentUser );

	const isEnabled = config.isEnabled( 'onboarding/email-verification' ) && flow === ONBOARDING_FLOW;

	// Verification is read before enablement, so turning the flag off mid-attempt can't be
	// mistaken for the user having confirmed.
	let status: GateStatus = 'clear';
	if ( currentUser?.email_verified ) {
		status = 'verified';
	} else if ( ! isEnabled ) {
		status = 'clear';
	} else if ( ! currentUser ) {
		status = 'pending';
	} else if ( ! currentUser.phone_account ) {
		status = 'gated';
	}

	return { isEnabled, status };
}
