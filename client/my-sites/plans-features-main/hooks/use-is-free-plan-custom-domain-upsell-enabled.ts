import { useMemo } from '@wordpress/element';
import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

const useIsFreePlanCustomDomainUpsellEnabled = (
	flowName?: string | null,
	paidDomainName?: string | null
): DataResponse< boolean > => {
	return useMemo( () => {
		if ( flowName === 'onboarding-pm' && paidDomainName ) {
			return {
				isLoading: false,
				result: true,
			};
		}

		return {
			isLoading: false,
			result: false,
		};
	}, [ flowName, paidDomainName ] );
};

export default useIsFreePlanCustomDomainUpsellEnabled;
