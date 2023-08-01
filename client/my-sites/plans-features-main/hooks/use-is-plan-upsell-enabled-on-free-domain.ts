import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from 'calypso/my-sites/plan-features-2023-grid/types';

export const useIsPlanUpsellEnabledOnFreeDomain = (
	flowName?: string | null
): DataResponse< boolean > => {
	const ONBOARDING_EXPERIMENT = 'calypso_gf_signup_onboarding_free_free_dont_miss_out_modal';
	const ONBOARDING_PM_EXPERIMENT = 'calypso_gf_signup_onboarding_pm_free_free_dont_miss_out_modal';
	const relevantExperiment =
		flowName === 'onboarding' ? ONBOARDING_EXPERIMENT : ONBOARDING_PM_EXPERIMENT;
	const [ isLoading, experimentAssignment ] = useExperiment( relevantExperiment );

	if ( ! [ 'onboarding', 'onboarding-pm' ].includes( flowName ?? '' ) ) {
		return {
			isLoading: false,
			result: false,
		};
	}
	return {
		isLoading,
		result: experimentAssignment?.variationName === 'treatment',
	};
};
