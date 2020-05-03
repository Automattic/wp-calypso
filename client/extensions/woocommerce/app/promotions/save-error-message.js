export function getSaveErrorMessage( slug, promotionName, translate ) {
	switch ( slug ) {
		case 'woocommerce_rest_coupon_code_already_exists':
			return translate(
				'There was a problem saving the %(promotion)s promotion. A coupon with this code already exists.',
				{
					args: { promotion: promotionName },
				}
			);
		default:
			return translate(
				'There was a problem saving the %(promotion)s promotion. Please try again.',
				{
					args: { promotion: promotionName },
				}
			);
	}
}
