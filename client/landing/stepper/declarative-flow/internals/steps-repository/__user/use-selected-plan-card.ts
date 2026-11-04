import { NEW_HOSTED_SITE_FLOW, ONBOARDING_FLOW } from '@automattic/onboarding';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { getPreselectedPlan } from 'calypso/landing/stepper/utils/preselected-plan';

type SelectedPlanCardResult = {
	planSlug: string | null;
	showPlanCard: boolean;
};

const ELIGIBLE_FLOWS: string[] = [ ONBOARDING_FLOW, NEW_HOSTED_SITE_FLOW ];

/**
 * Whether the account step should show the plan the visitor selected before signing up.
 * Links opt in with `showSelectedPlan=true` next to the `plan` they preselect.
 */
function useSelectedPlanCard( { flow }: { flow: string } ): SelectedPlanCardResult {
	const queryArgs = useQuery();
	const planSlug = ELIGIBLE_FLOWS.includes( flow ) ? getPreselectedPlan( queryArgs, flow ) : null;

	return {
		planSlug,
		showPlanCard: planSlug !== null && queryArgs.get( 'showSelectedPlan' ) === 'true',
	};
}

export default useSelectedPlanCard;
export type { SelectedPlanCardResult };
