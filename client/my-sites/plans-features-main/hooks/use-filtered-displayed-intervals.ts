import {
	getPlan,
	getBillingMonthsForTerm,
	isFreePlan,
	isWooHostedFreePlan,
	URL_FRIENDLY_TERMS_MAPPING,
	UrlFriendlyTermType,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { getSitePlanTermMonths, isScheduledTermChangeEnabled } from '../scheduled-term-change';
import { useFCCARestrictions } from './use-fcca-restrictions';
import type { SitePlanData } from 'calypso/state/sites/plans/types';

interface Props {
	flowName?: string | null;
	displayedIntervals: UrlFriendlyTermType[];
	paidDomainName?: string;
	productSlug?: string;
	/**
	 * The site's plans. A shorter term than the current plan's stays visible
	 * when one of its plans can be scheduled for the current plan's renewal.
	 */
	sitePlans?: SitePlanData[] | null;
}

const useFilteredDisplayedIntervals = ( {
	flowName,
	displayedIntervals,
	paidDomainName,
	productSlug,
	sitePlans,
}: Props ) => {
	const { shouldRestrict3YearPlans } = useFCCARestrictions();
	const is3yearlyRestricted = shouldRestrict3YearPlans();

	return useMemo( () => {
		let filteredIntervals = displayedIntervals;

		// Hide interval terms that are less than the current plan's term in months
		if ( productSlug && ! isFreePlan( productSlug ) && ! isWooHostedFreePlan( productSlug ) ) {
			const currentPlanIntervalInMonths = getBillingMonthsForTerm(
				getPlan( productSlug )?.term || ''
			);

			const scheduledChangeTermMonths = new Set(
				isScheduledTermChangeEnabled()
					? sitePlans
							?.filter( ( sitePlan ) => sitePlan.isDelayedDowngradeAvailable )
							.map( getSitePlanTermMonths )
					: []
			);

			filteredIntervals = displayedIntervals.filter( ( intervalType ) => {
				const intervalInMonths = getBillingMonthsForTerm(
					URL_FRIENDLY_TERMS_MAPPING[ intervalType ] || ''
				);

				return (
					intervalInMonths >= currentPlanIntervalInMonths ||
					scheduledChangeTermMonths.has( intervalInMonths )
				);
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
	}, [
		productSlug,
		displayedIntervals,
		flowName,
		paidDomainName,
		is3yearlyRestricted,
		sitePlans,
	] );
};

export default useFilteredDisplayedIntervals;
