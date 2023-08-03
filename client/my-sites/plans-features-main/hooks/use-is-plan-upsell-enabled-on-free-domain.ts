import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from 'calypso/my-sites/plan-features-2023-grid/types';

const useIsPlanUpsellEnabledOnFreeDomain = (
	flowName?: string | null,
	hasPaidDomain?: boolean
): DataResponse< boolean > => {
	const ONBOARDING_EXPERIMENT = 'calypso_gf_signup_onboarding_free_free_dont_miss_out_modal';
	const ONBOARDING_PM_EXPERIMENT = 'calypso_gf_signup_onboarding_pm_free_free_dont_miss_out_modal';
	const relevantExperiment =
		flowName === 'onboarding' ? ONBOARDING_EXPERIMENT : ONBOARDING_PM_EXPERIMENT;
	const [ isLoading, experimentAssignment ] = useExperiment( relevantExperiment, {
		isEligible: [ 'onboarding', 'onboarding-pm' ].includes( flowName ?? '' ) && ! hasPaidDomain,
	} );
	return {
		isLoading,
		result: experimentAssignment?.variationName === 'treatment',
	};
};

export default useIsPlanUpsellEnabledOnFreeDomain;
