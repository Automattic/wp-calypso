export const coupon1 = {
	id: 11,
	code: '10percentoff',
	amount: '10',
	discount_type: 'percent',
	date_created_gmt: '2017-10-07T07:07:23',
	date_expires_gmt: '2017-11-08T08:08:24',
};

export const coupon2 = {
	id: 12,
	code: '5bucks',
	amount: '5',
	discount_type: 'fixed_product',
	date_created_gmt: '2017-10-08T07:07:23',
	date_expires_gmt: '2017-11-09T08:08:24',
	product_ids: [ 1 ],
};

export const coupon3 = {
	id: 13,
	code: '10bucks',
	amount: '10',
	discount_type: 'fixed_cart',
	date_created_gmt: '2017-10-08T07:07:23',
	date_expires_gmt: '2017-11-09T08:08:24',
	product_categories: [ 22 ],
};
