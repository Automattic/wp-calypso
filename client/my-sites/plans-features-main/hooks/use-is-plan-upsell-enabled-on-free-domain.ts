import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

/**
 * TODO: Cleanup pending, this condition needs to be removed
 */
const useIsPlanUpsellEnabledOnFreeDomain = (
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	flowName?: string | null,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	hasPaidDomain?: boolean
): DataResponse< boolean > => {
	return {
		isLoading: false,
		result: true,
	};
};

export default useIsPlanUpsellEnabledOnFreeDomain;
