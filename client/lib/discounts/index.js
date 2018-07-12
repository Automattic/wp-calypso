/** @format */

import activeDiscounts from './active-discounts';

function getDiscountByName( discountName ) {
	const discount = activeDiscounts.find( function( discount ) {
		if ( discountName !== discount.name ) {
			return false;
		}

		const now = new Date();
		if (
			( discount.startsAt && discount.startsAt > now ) ||
			( discount.endsAt && discount.endsAt < now )
		) {
			return false;
		}

		return true;
	} );

	return typeof discount !== 'undefined' ? discount : false;
}

export { activeDiscounts, getDiscountByName };
