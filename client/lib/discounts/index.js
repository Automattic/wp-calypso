/** @format */

/**
 * Internal dependencies
 */
import activeDiscounts from './active-discounts';

function getDiscountByName( discountName, endsAt ) {
	const activeDiscount = activeDiscounts.find( function( discount ) {
		if ( discountName !== discount.name ) {
			return false;
		}

		if ( typeof endsAt !== 'undefined' ) discount.endsAt = endsAt;

		const now = new Date();
		if (
			( discount.startsAt && discount.startsAt > now ) ||
			( discount.endsAt && discount.endsAt < now )
		) {
			return false;
		}

		return true;
	} );

	return typeof activeDiscount !== 'undefined' ? activeDiscount : false;
}

export { activeDiscounts, getDiscountByName };
