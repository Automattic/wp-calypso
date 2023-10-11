import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

const useIsPlanUpsellEnabledOnFreeDomain = (
	flowName?: string | null
): DataResponse< boolean > => {
	if ( flowName === 'onboarding' || flowName === 'onboarding-pm' ) {
		return {
			isLoading: false,
			result: true,
		};
	}
	return {
		isLoading: false,
		result: false,
	};
};

export default useIsPlanUpsellEnabledOnFreeDomain;
