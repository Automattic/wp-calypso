import { useDomainToPlanCredits } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits';
import { useSelector } from 'calypso/state';
import { hasPurchasedDomain } from 'calypso/state/purchases/selectors/has-purchased-domain';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';

/**
 * This hook determines if the domain-to-plan upgrade credit should be visible in the current plans display context
 * and returns the credits value if applicable
 * @param siteId Considered site id
 * @returns number | null if the credit should not be displayed to the user
 */
export function useDomainToPlanCreditsApplicable( siteId?: number | null ): number | null {
	const hasDomain = !! useSelector( ( state ) => siteId && hasPurchasedDomain( state, siteId ) );
	const isSiteOnPaidPlan = !! useSelector(
		( state ) => siteId && isCurrentPlanPaid( state, siteId )
	);
	const isEligibleSite = hasDomain && ! isSiteOnPaidPlan;
	const creditsValue = useDomainToPlanCredits();

	return isEligibleSite ? creditsValue : null;
}
