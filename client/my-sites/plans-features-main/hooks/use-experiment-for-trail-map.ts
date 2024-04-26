import config from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from '@automattic/plans-grid-next';

interface Props {
	flowName?: string | null;
	isDesktop?: boolean;
}

function useExperimentForTrailMap( { flowName, isDesktop }: Props ): DataResponse< boolean > {
	const [ isLoadingDesktop, desktopExperimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_plans_offerings_copy_desktop',
		{
			isEligible: flowName === 'onboarding' && isDesktop,
		}
	);

	const [ isLoadingMobile, mobileExperimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_plans_offerings_copy_mobile',
		{
			isEligible: flowName === 'onboarding' && ! isDesktop,
		}
	);

	return {
		isLoading: isLoadingDesktop || isLoadingMobile,
		result:
			config.isEnabled( 'onboarding/trail-map-feature-grid' ) ||
			desktopExperimentAssignment?.variationName === 'treatment' ||
			mobileExperimentAssignment?.variationName === 'treatment',
	};
}

export default useExperimentForTrailMap;
