import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from 'calypso/my-sites/plan-features-2023-grid/types';

const useIsCustomDomainAllowedOnFreePlan = (
	flowName?: string | null,
	hasPaidDomainName?: boolean
): DataResponse< boolean > => {
	const EXPERIMENT_NAME =
		flowName === 'onboarding'
			? 'calypso_onboarding_plans_paid_domain_on_free_plan'
			: 'calypso_onboardingpm_plans_paid_domain_on_free_plan';
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: [ 'onboarding', 'onboarding-pm' ].includes( flowName ?? '' ) && hasPaidDomainName,
	} );

	return {
		isLoading,
		result: assignment?.variationName === 'treatment',
	};
};

export default useIsCustomDomainAllowedOnFreePlan;
