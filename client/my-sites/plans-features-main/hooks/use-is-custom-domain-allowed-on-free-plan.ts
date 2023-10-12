import { useMemo } from '@wordpress/element';
import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

const useIsCustomDomainAllowedOnFreePlan = (
	flowName?: string | null
): DataResponse< boolean > => {
	return useMemo( () => {
		if ( flowName === 'onboarding-pm' ) {
			return {
				isLoading: false,
				result: true,
			};
		}

		return {
			isLoading: false,
			result: false,
		};
	}, [ flowName ] );
};

export default useIsCustomDomainAllowedOnFreePlan;
