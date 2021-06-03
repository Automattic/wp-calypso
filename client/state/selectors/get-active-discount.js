/**
 * Internal dependencies
 */
import { activeDiscounts } from 'calypso/lib/discounts';
import { planMatches } from '@automattic/calypso-products';
import { hasActivePromotion } from 'calypso/state/active-promotions/selectors';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const isDiscountActive = ( discount, state ) => {
	const now = new Date();
	if ( ! discount.startsAt || ! discount.endsAt ) {
		return false;
	}

	if ( discount.startsAt > now || discount.endsAt < now ) {
		return false;
	}

	if ( ! hasActivePromotion( state, discount.name ) ) {
		return false;
	}

	if ( discount.targetPlans ) {
		const targetPlans = Array.isArray( discount.targetPlans ) ? discount.targetPlans : [];
		const selectedSitePlanSlug = getSitePlanSlug( state, getSelectedSiteId( state ) );
		return targetPlans.some( ( plan ) => planMatches( selectedSitePlanSlug, plan ) );
	}

	return true;
};

/**
 * Returns info whether the site is eligible for spring discount or not.
 *
 * @param  {object}  state Global state tree.
 * @returns {object|null}  Promo description
 */
export default ( state ) => {
	return activeDiscounts.find( ( p ) => isDiscountActive( p, state ) ) ?? null;
};
