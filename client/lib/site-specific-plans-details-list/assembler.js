function createSiteSpecificPlanObject( plan ) {
	return {
		currentPlan: Boolean( plan.current_plan ),
		expiry: plan.expiry,
		formattedDiscount: plan.formatted_discount,
		formattedPrice: plan.formatted_price,
		freeTrial: Boolean( plan.free_trial ),
		id: Number( plan.id ),
		productName: plan.product_name,
		productSlug: plan.product_slug,
		rawDiscount: plan.raw_discount,
		rawPrice: plan.raw_price,
		userFacingExpiry: plan.user_facing_expiry
	}
}

export default { createSiteSpecificPlanObject };
