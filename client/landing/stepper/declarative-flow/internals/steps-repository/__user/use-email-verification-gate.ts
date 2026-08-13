import config from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

// Names this flow to the backend, which routes the activation link on it so a gated user lands
// back here. Matched as an exact string: changing it here alone sends them somewhere else.
export const ACTIVATION_EMAIL_SOURCE = 'onboarding-with-email-verification';

// Variant A: the gate holds the user on the account step, right after creation.
const ACCOUNT_STEP_FLAG = 'onboarding/email-verification';
// Variant B: the account step never gates; the gate is met later, after the free plan selection
// or after checkout. Wired by the flow, not by this hook.
const DEFERRED_FLAG = 'onboarding/email-verification-deferred';

/**
 * Whether either variant is live for this flow. Both send the same activation email on account
 * creation and point its link back here, so the account step asks for that whichever gates.
 */
export function isEmailVerificationEnabled( flow: string ): boolean {
	return (
		flow === ONBOARDING_FLOW &&
		( config.isEnabled( ACCOUNT_STEP_FLAG ) || config.isEnabled( DEFERRED_FLAG ) )
	);
}

/**
 * Whether the gate is deferred past the account step (Variant B). The flow reads this to move the
 * gate to after the free plan selection or after checkout.
 */
export function isDeferredEmailVerification( flow: string ): boolean {
	return flow === ONBOARDING_FLOW && config.isEnabled( DEFERRED_FLAG );
}

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

	const isEnabled = config.isEnabled( ACCOUNT_STEP_FLAG ) && flow === ONBOARDING_FLOW;

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
