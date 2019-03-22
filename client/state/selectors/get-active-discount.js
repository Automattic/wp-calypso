/** @format */

/**
 * Internal dependencies
 */
import { activeDiscounts } from 'lib/discounts';
import { abtest } from 'lib/abtest';
import { planMatches } from 'lib/plans';
import { hasActivePromotion } from 'state/active-promotions/selectors';
import { getSitePlanSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import memoizeLast from 'lib/memoize-last';

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
		return targetPlans.some( plan => planMatches( selectedSitePlanSlug, plan ) );
	}

	if ( ! discount.abTestName ) {
		return true;
	}

	const variant = abtest( discount.abTestName );
	if ( variant === 'control' ) {
		return false;
	}

	return true;
};

// Some simple last value memoization to avoid constant re-renders.
const composeActiveDiscount = memoizeLast( ( discount, activeVariation ) => ( {
	...discount,
	...activeVariation,
} ) );

const NO_VARIATION = {};

/**
 * Returns info whether the site is eligible for spring discount or not.
 *
 * @param  {Object}  state Global state tree.
 * @return {Object|null}  Promo description
 */
export default state => {
	const discount = activeDiscounts.filter( p => isDiscountActive( p, state ) )[ 0 ];
	if ( ! discount ) {
		return null;
	}

	const activeVariation = discount.variations
		? discount.variations[ abtest( discount.abTestName ) ]
		: NO_VARIATION;

	return composeActiveDiscount( discount, activeVariation );
};
