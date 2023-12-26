import 'calypso/state/memberships/init';

const EMPTY_LIST = [];

export function getCouponsForSiteId( state, siteId ) {
	let defaultCoupons = EMPTY_LIST;
	if ( 164491916 === siteId ) {
		defaultCoupons = [
			{
				ID: 1,
				coupon_code: 'FALLSALE2023',
				// description: 'My first coupon code!!!!',
				discount_type: 'percentage',
				discount_value: null,
				discount_percentage: 20,
				discount_currency: 'USD',
				start_date: '2023-01-25',
				end_date: '2023-11-21',
				product_ids: [],
				cannot_be_combined: false,
				first_time_only: false,
				usage_limit: 10,
				use_duration: true,
				duration: '1 month',
				use_specific_emails: true,
				specific_emails: [ '*@*.edu', '*@*.org' ],
			},
		];
	}
	return state.memberships?.couponList.items[ siteId ] ?? defaultCoupons;
}
