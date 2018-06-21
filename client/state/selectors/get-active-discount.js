/** @format */

/**
 * External dependencies
 */
import { isArray, isPlainObject, map, some } from 'lodash';

/**
 * Internal dependencies
 */
import { activeDiscounts } from 'lib/discounts';
import { abtest } from 'lib/abtest';
import { planMatches } from 'lib/plans';
import { hasActivePromotion } from 'state/active-promotions/selectors';
import { getSitePlanSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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

	if ( isPlainObject( discount.targetPlan ) ) {
		const selectedSiteId = getSelectedSiteId( state );
		const selectedSitePlanSlug = getSitePlanSlug( state, selectedSiteId );

		return planMatches( selectedSitePlanSlug, discount.targetPlan );
	}

	if ( isArray( discount.targetPlans ) ) {
		const selectedSiteId = getSelectedSiteId( state );
		const selectedSitePlanSlug = getSitePlanSlug( state, selectedSiteId );

		return some(
			map( discount.targetPlans, criteria => planMatches( selectedSitePlanSlug, criteria ) )
		);
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
		: {};
	return {
		...discount,
		...activeVariation,
	};
};
