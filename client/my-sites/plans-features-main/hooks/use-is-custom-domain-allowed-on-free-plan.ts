import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from 'calypso/my-sites/plan-features-2023-grid/types';

const useIsCustomDomainAllowedOnFreePlan = (
	flowName?: string | null,
	hasPaidDomainName?: boolean
): DataResponse< boolean > => {
	const [ isLoadingAnyDomainExperiment, assignmentAnyDomainExperiment ] = useExperiment(
		'calypso_onboardingpm_plans_paid_domain_on_free_plan',
		{
			isEligible: [ 'onboarding', 'onboarding-pm' ].includes( flowName ?? '' ) && hasPaidDomainName,
		}
	);

	return {
		isLoading: isLoadingAnyDomainExperiment,
		result: assignmentAnyDomainExperiment?.variationName === 'treatment',
	};
};

export default useIsCustomDomainAllowedOnFreePlan;
