export const couponParams1 = { offset: 0, per_page: 5 };
export const coupons1 = [
	{
		id: 2,
		code: 'two',
		amount: '2',
		discount_type: 'fixed_cart',
		date_created: '2017-09-07T12:50:50',
		date_expires: '2017-10-20T12:50:50',
	},
	{
		id: 1,
		code: 'one',
		amount: '1',
		discount_type: 'fixed_cart',
		date_created: '2017-09-06T13:54:50',
		date_expires: '2017-10-15T13:54:50',
	},
	{
		id: 4,
		code: 'four',
		amount: '4',
		discount_type: 'percent',
		date_created: '2017-09-09T09:50:50',
		date_expires: '2017-10-28T09:50:50',
	},
	{
		id: 3,
		code: 'three',
		amount: '3',
		discount_type: 'percent',
		date_created: '2017-09-08T10:50:50',
		date_expires: '2017-10-25T10:50:50',
	},
	{
		id: 5,
		code: 'five',
		amount: '5',
		discount_type: 'percent',
		date_created: '2017-09-10T10:50:50',
		date_expires: undefined,
	},
];

export const couponParams2 = { offset: 5, per_page: 5 };
export const coupons2 = [
	{
		id: 6,
		code: 'six',
		amount: '6',
		discount_type: 'fixed_cart',
		date_created: '2017-09-11T12:50:50',
		date_expires: undefined,
	},
	{
		id: 7,
		code: 'seven',
		amount: '7',
		discount_type: 'percent',
		date_created: '2017-09-12T04:54:50',
		date_expires: '2017-11-05T04:54:50',
	},
];

export const productParams1 = { offset: 0, per_page: 3 };
export const products1 = [
	{
		id: 2,
		name: 'Two',
		slug: 'two',
		regular_price: '2.00',
		sale_price: '1.20',
		date_on_sale_from: undefined,
		date_on_sale_to: undefined,
	},
	{
		id: 4,
		name: 'Four',
		slug: 'four',
		regular_price: '4.00',
		sale_price: '3.40',
		date_on_sale_from: '2017-10-20T04:01:10',
		date_on_sale_to: '2017-10-20T04:01:10',
	},
	{
		id: 3,
		name: 'Three',
		slug: 'three',
		regular_price: '3.00',
		sale_price: '',
		date_on_sale_from: undefined,
		date_on_sale_to: undefined,
	},
];

export const productParams2 = { offset: 3, per_page: 3 };
export const products2 = [
	{
		id: 1,
		name: 'One',
		slug: 'one',
		regular_price: '1.00',
		sale_price: '0.10',
		date_on_sale_from: '2017-09-01T01:01:10',
		date_on_sale_to: '2017-09-10T01:01:10',
	},
];
