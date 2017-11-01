
export function isValidPromotion( promotion ) {
	if ( ! promotion || ! promotion.type ) {
		return false;
	}

	const validCouponCode = promotion.couponCode && promotion.couponCode.length > 0;

	switch ( promotion.type ) {
		case 'product_sale':
			const { productIds } = promotion.appliesTo || {};
			const validProductTarget = ( productIds && productIds.length === 1 );
			const validSalePrice = promotion.salePrice && promotion.salePrice.length > 0;
			return validProductTarget && validSalePrice;
		case 'percent':
			const validPercent = promotion.percentDiscount && promotion.percentDiscount > 0;
			return validCouponCode && validPercent;
		case 'fixed_cart':
		case 'fixed_product':
			const validFixedDiscount = promotion.fixedDiscount && promotion.fixedDiscount > 0;
			return validCouponCode && validFixedDiscount;
		default:
			return false;
	}
}

