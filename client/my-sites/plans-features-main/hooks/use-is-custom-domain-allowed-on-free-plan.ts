import { getTld } from 'calypso/lib/domains';
import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from 'calypso/my-sites/plan-features-2023-grid/types';

const useIsCustomDomainAllowedOnFreePlan = (
	flowName?: string | null,
	domainName?: string
): DataResponse< boolean > => {
	const [ isLoadingBlogAllowExperiment, assignmentDotBlogAllowExperiment ] = useExperiment(
		'calypso_onboarding_plans_dotblog_on_free_plan_202307',
		{
			isEligible:
				flowName === 'onboarding' && domainName != null && getTld( domainName ) === 'blog',
		}
	);

	const [ isLoadingAnyDomainExperiment, assignmentAnyDomainExperiment ] = useExperiment( '<TBD>', {
		isEligible: flowName === 'onboarding-pm' && domainName != null,
	} );

	return {
		isLoading: isLoadingAnyDomainExperiment || isLoadingBlogAllowExperiment,
		result:
			assignmentDotBlogAllowExperiment?.variationName === 'treatment' ||
			assignmentAnyDomainExperiment?.variationName === 'treatment',
	};
};

export default useIsCustomDomainAllowedOnFreePlan;
