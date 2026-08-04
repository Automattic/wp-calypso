import config from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

// `pending` is not a kind of `clear`: the user's ID survives a reload but the user object does
// not, so there is a window where the account is logged in and nothing is known about it. Reading
// those absent fields as an unverified email opens the gate onto a blank address.
type GateStatus = 'pending' | 'clear' | 'gated';

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
 * This opens the gate; it doesn't close it. See the latch in the account step.
 *
 * The experiment arm joins this expression once the experiment exists, rather than `/me`, so that
 * enrolment happens where the user meets the gate.
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
