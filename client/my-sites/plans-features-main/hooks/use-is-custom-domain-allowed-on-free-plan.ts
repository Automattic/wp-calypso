import { getTld } from 'calypso/lib/domains';
import { useExperiment } from 'calypso/lib/explat';

const useIsCustomDomainAllowedOnFreePlan = (
	flowName?: string | null,
	domainName?: string
): [ boolean, boolean ] => {
	const [ isLoadingAssignment, experimentAssignment ] = useExperiment(
		'calypso_onboarding_plans_dotblog_on_free_plan_202307',
		{
			isEligible:
				flowName === 'onboarding' && domainName != null && getTld( domainName ) === 'blog',
		}
	);

	return [ isLoadingAssignment, experimentAssignment?.variationName === 'treatment' ];
};

export default useIsCustomDomainAllowedOnFreePlan;
