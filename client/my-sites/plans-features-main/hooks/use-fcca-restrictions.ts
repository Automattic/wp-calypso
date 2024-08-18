import {
	PLAN_PERSONAL_3_YEARS,
	PLAN_PREMIUM_3_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
} from '@automattic/calypso-products';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { useSelector } from 'calypso/state';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Custom hook to determine FCCA (Federal Cartel Office of Germany) related plan restrictions.
 *
 * This hook checks if the user is in Germany and applies specific plan restrictions based on the
 * current site and plan selected. It ensures that 3-year plans are replaced with their
 * respective 2-year versions for users in Germany.
 * @returns {Object} - An object containing two functions:
 *   - shouldRestrict3YearPlans: Determines if 3-year plans are restricted on FCCA restrictions.
 */
export const useFCCARestrictions = () => {
	const userCountryCode = useSelector( getCurrentUserCountryCode );
	const currentSite = useSelector( getSelectedSite );
	const sitePlan = useSelector( ( state ) => getCurrentPlan( state, currentSite?.ID ) );
	const geoQuery = useGeoLocationQuery();

	const replaceablePlanSlugs: string[] = [
		PLAN_PERSONAL_3_YEARS,
		PLAN_PREMIUM_3_YEARS,
		PLAN_BUSINESS_3_YEARS,
		PLAN_ECOMMERCE_3_YEARS,
	];

	const isFCCACountry = (): boolean => {
		return ( userCountryCode || geoQuery.data?.country_short ) === 'DE';
	};

	const isReplaceablePlan = ( planSlug: string ): boolean => {
		return replaceablePlanSlugs.indexOf( planSlug ) !== -1;
	};
	const shouldRestrict3YearPlans = ( newPlanSlug?: string ): boolean => {
		return (
			isFCCACountry() &&
			// We should still allow the user to see the current plan.
			! isReplaceablePlan( sitePlan?.productSlug ) &&
			( ! newPlanSlug || isReplaceablePlan( newPlanSlug ) )
		);
	};
	return {
		shouldRestrict3YearPlans,
	};
};
