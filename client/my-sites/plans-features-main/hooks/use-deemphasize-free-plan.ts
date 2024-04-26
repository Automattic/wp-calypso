import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from '@automattic/plans-grid-next';

function useDeemphasizeFreePlan(
	flowName?: string | null,
	paidDomainName?: string
): DataResponse< boolean > {
	const [ isLoading, experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_deemphasize_free_plan',
		{
			isEligible: flowName === 'onboarding',
		}
	);

	return {
		isLoading,
		result: experimentAssignment?.variationName === 'treatment' && paidDomainName != null,
	};
}

export default useDeemphasizeFreePlan;
