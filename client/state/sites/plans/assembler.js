/**
 * External dependencies
 */
import moment from 'moment';

const createSitePlanObject = ( plan ) => {
	return {
		canStartTrial: Boolean( plan.can_start_trial ),
		currentPlan: Boolean( plan.current_plan ),
		expiry: plan.current_plan ? plan.expiry : null,
		expiryMoment: plan.current_plan ? moment( plan.expiry ) : null,
		formattedDiscount: plan.formatted_discount,
		formattedPrice: plan.formatted_price,
		freeTrial: Boolean( plan.free_trial ),
		id: Number( plan.id ),
		productName: plan.product_name,
		productSlug: plan.product_slug,
		rawDiscount: plan.raw_discount,
		rawPrice: plan.raw_price,
		subscribedDate: plan.current_plan ? plan.subscribed_date : null,
		subscribedMoment: plan.current_plan ? moment( plan.subscribed_date ) : null,
		userFacingExpiry: plan.current_plan ? plan.user_facing_expiry : null,
		userFacingExpiryMoment: plan.current_plan ? moment( plan.user_facing_expiry ).add( { day: 1 } ) : null
	};
};

export default {
	createSitePlanObject
}
