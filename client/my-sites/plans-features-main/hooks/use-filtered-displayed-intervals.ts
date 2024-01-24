import {
	getPlan,
	getBillingMonthsForTerm,
	isFreePlan,
	URL_FRIENDLY_TERMS_MAPPING,
	UrlFriendlyTermType,
} from '@automattic/calypso-products';
import { PlansIntent } from '@automattic/plans-grid-next';
import { useMemo } from 'react';

interface Props {
	intent?: PlansIntent;
	displayedIntervals: UrlFriendlyTermType[];
	paidDomainName?: string;
	productSlug?: string;
}

const useFilteredDisplayedIntervals = ( {
	intent,
	displayedIntervals,
	paidDomainName,
	productSlug,
}: Props ) => {
	return useMemo( () => {
		let filteredIntervals = displayedIntervals;

		// Hide interval terms that are less than the current plan's term in months
		if ( productSlug && ! isFreePlan( productSlug ) ) {
			const currentPlanIntervalInMonths = getBillingMonthsForTerm(
				getPlan( productSlug )?.term || ''
			);

			filteredIntervals = displayedIntervals.filter( ( intervalType ) => {
				const intervalInMonths = getBillingMonthsForTerm(
					URL_FRIENDLY_TERMS_MAPPING[ intervalType ] || ''
				);

				return intervalInMonths >= currentPlanIntervalInMonths;
			} );
		}

		if ( intent === 'plans-paid-media' ) {
			if ( paidDomainName ) {
				filteredIntervals = [ 'yearly', '2yearly', '3yearly' ];
			}
		}

		return filteredIntervals;
	}, [ productSlug, displayedIntervals, intent, paidDomainName ] );
};

export default useFilteredDisplayedIntervals;
