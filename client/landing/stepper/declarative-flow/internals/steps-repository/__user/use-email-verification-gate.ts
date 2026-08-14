import { isOnboardingFlow } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

// Names this flow to the backend, which routes the activation link on it so a gated user lands
// back here. Matched as an exact string: changing it here alone sends them somewhere else.
export const ACTIVATION_EMAIL_SOURCE = 'onboarding-with-email-verification';

// 3-arm placement test for the onboarding email-verification gate.
//   control                         -> no step (current default)
//   treatment_post_account_creation -> gate right after account creation (Variant A)
//   treatment_post_plan_selection   -> gate after free-plan selection or after checkout (Variant B)
const EXPERIMENT_NAME = 'calypso_signup_onboarding_email_verification_202608';

type EmailVerificationVariant =
	| 'control'
	| 'treatment_post_account_creation'
	| 'treatment_post_plan_selection';

/**
 * The assigned arm of the email-verification experiment, defaulting to `control` while the
 * assignment loads or for any flow but onboarding.
 *
 * Enrolment happens where this is first read — the account step, which every onboarding signup
 * passes through — matching the experiment's "attribution at account creation" design.
 */
function useEmailVerificationVariant( flow: string ): {
	isLoading: boolean;
	variant: EmailVerificationVariant;
} {
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: isOnboardingFlow( flow ),
	} );

	const variant = (
		isLoading ? 'control' : assignment?.variationName ?? 'control'
	) as EmailVerificationVariant;

	return { isLoading, variant };
}

/**
 * Whether either treatment is live for this flow. Both send the same activation email on account
 * creation and point its link back here, so the account step asks for that whichever gates.
 */
export function useIsEmailVerificationEnabled( flow: string ): boolean {
	const { variant } = useEmailVerificationVariant( flow );
	return (
		variant === 'treatment_post_account_creation' || variant === 'treatment_post_plan_selection'
	);
}

/**
 * Whether the gate is deferred past the account step (Variant B). The flow reads this to move the
 * gate to after the free plan selection or after checkout.
 */
export function useIsPostPlanSelectionEmailVerification( flow: string ): boolean {
	const { variant } = useEmailVerificationVariant( flow );
	return variant === 'treatment_post_plan_selection';
}

// `pending` is not a kind of `clear`: the user's ID survives a reload but the user object does
// not, so there is a window where the account is logged in and nothing is known about it. Reading
// those absent fields as an unverified email opens the gate onto a blank address.
//
// `verified` is not a kind of `clear` either. Only `/me` saying so means an attempt was actually
// confirmed; `clear` also covers the arm being control, which is not the same thing at all.
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
 */
export function useEmailVerificationGate( flow: string ): EmailVerificationGate {
	const currentUser = useSelector( getCurrentUser );
	const { isLoading, variant } = useEmailVerificationVariant( flow );

	const isEnabled = variant === 'treatment_post_account_creation';

	// Verification is read before enablement, so a control assignment can't be mistaken for the
	// user having confirmed.
	let status: GateStatus = 'clear';
	if ( currentUser?.email_verified ) {
		status = 'verified';
	} else if ( isLoading ) {
		// Hold rather than clear until the arm is known, so a would-be-gated account isn't advanced
		// past the step before the assignment resolves.
		status = 'pending';
	} else if ( ! isEnabled ) {
		status = 'clear';
	} else if ( ! currentUser ) {
		status = 'pending';
	} else if ( ! currentUser.phone_account ) {
		status = 'gated';
	}

	return { isEnabled, status };
}
