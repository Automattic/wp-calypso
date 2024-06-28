import {
	getPlan,
	getBillingMonthsForTerm,
	isFreePlan,
	URL_FRIENDLY_TERMS_MAPPING,
	UrlFriendlyTermType,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useFCCARestrictions } from './use-fcca-restrictions';

interface Props {
	flowName?: string | null;
	displayedIntervals: UrlFriendlyTermType[];
	paidDomainName?: string;
	productSlug?: string;
}

const useFilteredDisplayedIntervals = ( {
	flowName,
	displayedIntervals,
	paidDomainName,
	productSlug,
}: Props ) => {
	const { shouldRestrict3YearPlans } = useFCCARestrictions();
	const is3yearlyRestricted = shouldRestrict3YearPlans();

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

		if ( 'onboarding-pm' === flowName ) {
			// Monetizing free domain users is hard. From experience, users who choose a free domain
			// have very low intent to purchase something during signup. We show a cheaper and flexible
			// monthly option for this specific segment, but hide it if a custom domain is selected.
			if ( paidDomainName ) {
				filteredIntervals = [ 'yearly', '2yearly', '3yearly' ];
			}
		}

		if ( is3yearlyRestricted ) {
			filteredIntervals = filteredIntervals.filter( ( item ) => item !== '3yearly' );
		}

		return filteredIntervals;
	}, [ productSlug, displayedIntervals, flowName, paidDomainName, is3yearlyRestricted ] );
};

export default useFilteredDisplayedIntervals;
