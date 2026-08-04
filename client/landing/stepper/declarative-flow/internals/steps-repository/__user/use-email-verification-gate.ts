import config from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useSelector } from 'calypso/state';
import { getCurrentUser, isUserLoggedIn } from 'calypso/state/current-user/selectors';

interface EmailVerificationGate {
	// The feature is on for this flow, whoever the user turns out to be. Account creation needs
	// this before `/me` has answered anything.
	isEnabled: boolean;
	// This user is held on the gate rather than continuing into the flow.
	isGated: boolean;
}

/**
 * Whether the account step holds the user on the email verification gate.
 *
 * `/me` decides it, so the answer holds in any tab or session rather than only the one that signed
 * up. Email registrations are the whole of what it reaches: social accounts are created already
 * verified, and a phone account carries a generated address it hasn't replaced yet — unverified
 * for a reason this screen has no answer for, since there's no link sitting in an inbox to go and
 * click.
 *
 * The experiment arm joins this expression once the experiment exists. It belongs here rather than
 * in `/me` so that enrolment happens where the user actually meets the gate.
 */
export function useEmailVerificationGate( flow: string ): EmailVerificationGate {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const currentUser = useSelector( getCurrentUser );

	const isEnabled = config.isEnabled( 'onboarding/email-verification' ) && flow === ONBOARDING_FLOW;

	return {
		isEnabled,
		isGated:
			isEnabled && isLoggedIn && ! currentUser?.email_verified && ! currentUser?.phone_account,
	};
}
