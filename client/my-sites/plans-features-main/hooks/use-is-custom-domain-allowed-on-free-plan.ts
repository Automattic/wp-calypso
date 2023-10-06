import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

const useIsCustomDomainAllowedOnFreePlan = (
	flowName?: string | null,
	hasPaidDomainName?: boolean
): DataResponse< boolean > => {
	const EXPERIMENT_NAME =
		flowName === 'onboarding'
			? 'calypso_onboarding_plans_paid_domain_on_free_plan_confidence_check'
			: '';
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: flowName === 'onboarding' && hasPaidDomainName,
	} );

	/** Ships experiment variant to onboarding-pm flow only  */
	if ( flowName === 'onboarding-pm' ) {
		return {
			isLoading: false,
			result: true,
		};
	}

	return {
		isLoading,
		result: assignment?.variationName === 'treatment',
	};
};

export default useIsCustomDomainAllowedOnFreePlan;
