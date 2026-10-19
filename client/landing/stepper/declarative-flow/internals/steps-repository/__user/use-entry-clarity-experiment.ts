import { isOnboardingFlow } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useExperiment } from 'calypso/lib/explat';

/**
 * Whether the account step shows the calypso_account_step_entry_clarity_202609 treatment:
 * "Log in" below the buttons, an envelope on the email button, and login's heading gap.
 *
 * Only the onboarding flow at 960px and up takes part: below 960px signup and login both keep
 * the top-right link, and every other flow stays on the current experience. Woo-referrer users
 * are left out because their email-first layout already has the in-form link and no email button.
 */
export default function useEntryClarityExperiment( flow: string ): boolean {
	const isWooReferrer = useQuery().get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF;
	const isLargeViewport = useViewportMatch( 'large' );

	const [ isLoading, assignment ] = useExperiment( 'calypso_account_step_entry_clarity_202609', {
		isEligible: isOnboardingFlow( flow ) && isLargeViewport && ! isWooReferrer,
	} );

	// Control while loading, so the step renders without waiting on the assignment. The viewport
	// check repeats here in case the window shrinks after assignment.
	return ! isLoading && isLargeViewport && assignment?.variationName === 'treatment';
}
