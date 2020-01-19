/**
 * External dependencies
 */

import moment from 'moment';

export const createSitePlanObject = plan => {
	if ( ! plan ) {
		return {};
	}

	return {
		autoRenew: Boolean( plan.auto_renew ), // Always true for plans paid with credits.
		autoRenewDateMoment: plan.auto_renew_date
			? moment( plan.auto_renew_date ).startOf( 'day' )
			: null,
		canStartTrial: Boolean( plan.can_start_trial ),
		currentPlan: Boolean( plan.current_plan ),
		currencyCode: plan.currency_code,
		discountReason: plan.discount_reason,
		expiry: plan.expiry,
		expiryMoment: plan.expiry ? moment( plan.expiry ).startOf( 'day' ) : null,
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
		subscribedDayMoment: moment( plan.subscribed_date ).startOf( 'day' ),
		userIsOwner: Boolean( plan.user_is_owner ),
	};
};
