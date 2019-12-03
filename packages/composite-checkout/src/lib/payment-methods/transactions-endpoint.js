// Create cart object as required by the WPCOM transactions endpoint '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
export function createCartFromLineItems( {
	siteId,
	couponId,
	items,
	country,
	postalCode,
	subdivisionCode,
} ) {
	const currency = items.reduce( ( firstValue, item ) => firstValue || item.amount.currency, null );
	return {
		blog_id: siteId,
		coupon: couponId || '',
		currency: currency || '',
		temporary: false,
		extra: [],
		products: items.map( item => ( {
			product_id: item.id,
			meta: '', // TODO: get this for domains, etc
			currency: item.amount.currency,
			volume: 1,
		} ) ),
		tax: {
			location: {
				country_code: country,
				postal_code: postalCode,
				subdivision_code: subdivisionCode,
			},
		},
	};
}
