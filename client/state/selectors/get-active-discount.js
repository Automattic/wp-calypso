/** @format */

/**
 * Internal dependencies
 */
import { activeDiscounts } from 'lib/discounts';
import { abtest } from 'lib/abtest';
import { hasActivePromotion } from 'state/active-promotions/selectors';

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
