import config from '@automattic/calypso-config';
import type { DataResponse } from '@automattic/plans-grid-next';

function useDeemphasizeFreePlan(
	flowName?: string | null,
	paidDomainName?: string
): DataResponse< boolean > {
	if (
		config.isEnabled( 'onboarding/deemphasize-free-plan' ) &&
		flowName === 'onboarding' &&
		paidDomainName != null
	) {
		return {
			isLoading: false,
			result: true,
		};
	}

	return {
		isLoading: false,
		result: false,
	};
}

export default useDeemphasizeFreePlan;
