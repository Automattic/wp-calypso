/**
 * Internal dependencies
 */
import moment from 'moment';

function createSiteSpecificPlanObject( plan ) {
	return {
		currentPlan: Boolean( plan.current_plan ),
		expiry: plan.expiry,
		expiryMoment: moment( plan.expiry ),
		formattedDiscount: plan.formatted_discount,
		formattedPrice: plan.formatted_price,
		freeTrial: Boolean( plan.free_trial ),
		id: Number( plan.id ),
		productName: plan.product_name,
		productSlug: plan.product_slug,
		rawDiscount: plan.raw_discount,
		rawPrice: plan.raw_price,
		subscribedDate: plan.subscribed_date,
		subscribedMoment: moment( plan.subscribed_date ),
		userFacingExpiry: plan.user_facing_expiry
	}
}

export default { createSiteSpecificPlanObject };
