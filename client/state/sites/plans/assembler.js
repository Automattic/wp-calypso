export const createSitePlanObject = ( plan ) => {
	if ( ! plan ) {
		return {};
	}

	return {
		autoRenew: Boolean( plan.auto_renew ), // Always true for plans paid with credits.
		autoRenewDate: plan.auto_renew_date,
		canStartTrial: Boolean( plan.can_start_trial ),
		currentPlan: Boolean( plan.current_plan ),
		currencyCode: plan.currency_code,
		discountReason: plan.discount_reason,
		expiry: plan.expiry,
		expiryDate: plan.expiry,
		formattedDiscount: plan.formatted_discount,
		formattedOriginalPrice: plan.formatted_original_price,
		formattedPrice: plan.formatted_price,
		freeTrial: Boolean( plan.free_trial ),
		hasDomainCredit: Boolean( plan.has_domain_credit ),
		id: Number( plan.id ),
		interval: Number( plan.interval ),
		isDomainUpgrade: Boolean( plan.is_domain_upgrade ),
		productName: plan.product_name,
		productSlug: plan.product_slug,
		rawDiscount: plan.raw_discount,
		rawPrice: plan.raw_price,
		subscribedDate: plan.subscribed_date,
		userIsOwner: Boolean( plan.user_is_owner ),
	};
};
