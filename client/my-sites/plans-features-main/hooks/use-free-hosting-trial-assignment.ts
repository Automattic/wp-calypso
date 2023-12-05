import { isEnabled } from '@automattic/calypso-config';
import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useExperiment } from 'calypso/lib/explat';
import type { OnboardSelect } from '@automattic/data-stores';
import type { PlansIntent } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

export function useFreeHostingTrialAssignment( intent: PlansIntent | undefined ): {
	isLoadingHostingTrialExperiment: boolean;
	isAssignedToHostingTrialExperiment: boolean;
} {
	const hasHostingTrialOnboardingFlag = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).isHostingTrialAvailable(),
		[]
	);

	const isForcedToTreatment = isEnabled( 'plans/hosting-trial' ) || hasHostingTrialOnboardingFlag;

	const [ isLoadingHostingTrialExperiment, experimentAssignment ] = useExperiment(
		'wpcom_hosting_business_plan_free_trial_v2',
		{
			isEligible: intent === 'plans-new-hosted-site' && ! isForcedToTreatment,
		}
	);

	if ( isForcedToTreatment ) {
		return {
			isLoadingHostingTrialExperiment: false,
			isAssignedToHostingTrialExperiment: intent === 'plans-new-hosted-site',
		};
	}

	return {
		isLoadingHostingTrialExperiment,
		isAssignedToHostingTrialExperiment: experimentAssignment?.variationName === 'treatment',
	};
}
