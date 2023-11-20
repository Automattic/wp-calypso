import { isEnabled } from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import type { PlansIntent } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

export function useFreeHostingTrialAssignment( intent: PlansIntent | undefined ): {
	isLoadingHostingTrialExperiment: boolean;
	isAssignedToHostingTrialExperiment: boolean;
} {
	const [ isLoadingHostingTrialExperiment, experimentAssignment ] = useExperiment(
		'wpcom_hosting_business_plan_free_trial_v2',
		{
			isEligible: intent === 'plans-new-hosted-site' && ! isEnabled( 'plans/hosting-trial' ),
		}
	);

	if ( isEnabled( 'plans/hosting-trial' ) ) {
		return {
			isLoadingHostingTrialExperiment: false,

			// The plans/hosting-trial flag forces the user to be treated as if they're in the treatment group.
			isAssignedToHostingTrialExperiment: intent === 'plans-new-hosted-site',
		};
	}

	return {
		isLoadingHostingTrialExperiment,
		isAssignedToHostingTrialExperiment: experimentAssignment?.variationName === 'treatment',
	};
}
