import activeDiscounts from './active-discounts';

function getDiscountByName( discountName: string, endsAt: Date | null = null ) {
	const activeDiscount = activeDiscounts.find( function ( discount ) {
		if ( discountName !== discount.name ) {
			return false;
		}

		discount.endsAt = endsAt || discount.endsAt;

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
