/**
 * External dependencies
 */
import moment from 'moment';

const createSitePlanObject = ( plan ) => {
	if ( ! plan ) {
		return {};
	}

	return {
		auto_renew: Boolean( plan.auto_renew ),
		canStartTrial: Boolean( plan.can_start_trial ),
		currentPlan: Boolean( plan.current_plan ),
		currencyCode: plan.currency_code,
		discountReason: plan.discount_reason,
		expiry: plan.expiry,
		expiryMoment: moment( plan.expiry ).startOf( 'day' ),
		formattedDiscount: plan.formatted_discount,
		formattedPrice: plan.formatted_price,
		freeTrial: Boolean( plan.free_trial ),
		hasDomainCredit: Boolean( plan.has_domain_credit ),
		id: Number( plan.id ),
		interval: Number( plan.interval ),
		productName: plan.product_name,
		productSlug: plan.product_slug,
		rawDiscount: plan.raw_discount,
		rawPrice: plan.raw_price,
		subscribedDate: plan.subscribed_date,
		subscribedDayMoment: moment( plan.subscribed_date ).startOf( 'day' ),
		userFacingExpiry: plan.user_facing_expiry,
		userFacingExpiryMoment: moment( plan.user_facing_expiry ).startOf( 'day' ),
		userIsOwner: Boolean( plan.user_is_owner )
	};
};

export default {
	createSitePlanObject
};
