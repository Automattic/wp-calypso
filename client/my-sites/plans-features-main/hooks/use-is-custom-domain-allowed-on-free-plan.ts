import { getTld } from 'calypso/lib/domains';
import { useExperiment } from 'calypso/lib/explat';

const useIsCustomDomainAllowedOnFreePlan = ( domainName?: string ): [ boolean, boolean | null ] => {
	const [ isLoadingAssignment, experimentAssignment ] = useExperiment(
		'calypso_onboarding_plans_dotblog_on_free_plan_202307'
	);

	if ( isLoadingAssignment ) {
		return [ true, null ];
	}

	return [
		isLoadingAssignment,
		experimentAssignment?.variationName === 'treatment'
			? domainName != null && getTld( domainName ) === 'blog'
			: false,
	];
};

export default useIsCustomDomainAllowedOnFreePlan;
