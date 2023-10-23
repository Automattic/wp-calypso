import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

const useIsFreeDomainFreePlanUpsellEnabled = (
	flowName?: string | null,
	paidDomainName?: string | null
): DataResponse< boolean > => {
	if ( ! paidDomainName && flowName === 'onboarding-pm' ) {
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

export default useIsFreeDomainFreePlanUpsellEnabled;
