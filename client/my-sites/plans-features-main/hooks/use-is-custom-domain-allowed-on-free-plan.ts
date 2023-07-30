import { getTld } from 'calypso/lib/domains';
import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from 'calypso/my-sites/plan-features-2023-grid/types';

const useIsCustomDomainAllowedOnFreePlan = (
	flowName?: string | null,
	domainName?: string
): DataResponse< boolean > => {
	const [ isLoadingAssignment, experimentAssignment ] = useExperiment(
		'calypso_onboarding_plans_dotblog_on_free_plan_202307',
		{
			isEligible:
				flowName === 'onboarding' && domainName != null && getTld( domainName ) === 'blog',
		}
	);

	return {
		isLoading: isLoadingAssignment,
		result: experimentAssignment?.variationName === 'treatment',
	};
};

export default useIsCustomDomainAllowedOnFreePlan;
