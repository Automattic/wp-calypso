import 'calypso/state/memberships/init';

const EMPTY_LIST = [];

export function getCouponsForSiteId( state, siteId ) {
	let defaultCoupons = EMPTY_LIST;
	if ( 164491916 === siteId ) {
		defaultCoupons = [
			{
				coupon_code: 'FALLSALE2023',
				description: 'My first coupon code!!!!',
				discount_type: 'percentage',
				discount_value: null,
				discount_percentage: 20, //TODO: divide amount into value and percentage vars
				discount_currency: 'USD',
				start_date: '20230125',
				end_date: '20231121',
				product_ids: [],
				can_be_combined: false,
				first_time_only: false,
				use_duration: true,
				duration: 'Forever',
				use_specific_emails: false,
				specific_emails: [],
			},
		];
	}
	return state.memberships?.couponList.items[ siteId ] ?? defaultCoupons;
}
