export const createSitePlanObject = ( plan ) => {
	if ( ! plan ) {
		return {};
	}

	return {
		autoRenew: Boolean( plan.auto_renew ), // Always true for plans paid with credits.
		autoRenewDate: plan.auto_renew_date,
		currentPlan: Boolean( plan.current_plan ),
		currencyCode: plan.currency_code,
		expiry: plan.expiry,
		expiryDate: plan.expiry,
		freeTrial: Boolean( plan.free_trial ),
		hasDomainCredit: Boolean( plan.has_domain_credit ),
		id: Number( plan.id ),
		interval: Number( plan.interval ),
		productName: plan.product_name,
		productSlug: plan.product_slug,
		rawDiscount: plan.raw_discount,
		rawDiscountInteger: plan.raw_discount_integer,
		rawPrice: plan.raw_price,
		rawPriceInteger: plan.raw_price_integer,
		subscribedDate: plan.subscribed_date,
		userIsOwner: Boolean( plan.user_is_owner ),
	};
};
