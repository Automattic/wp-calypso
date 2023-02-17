import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export const domainProduct: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: '.cash Domain',
	product_slug: 'domain_reg',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: 'foo.cash',
	product_id: 6,
	volume: 1,
	is_domain_registration: true,
	item_original_cost_integer: 500,
	item_subtotal_integer: 500,
	bill_period: '365',
	months_per_bill_period: 12,
};

export const caDomainProduct: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: '.ca Domain',
	product_slug: 'domain_reg',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: 'foo.ca',
	product_id: 6,
	volume: 1,
	is_domain_registration: true,
	item_original_cost_integer: 500,
	item_subtotal_integer: 500,
	bill_period: '365',
	months_per_bill_period: 12,
};

export const gSuiteProduct: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'G Suite',
	product_slug: 'gapps',
	currency: 'BRL',
	extra: {},
	meta: 'foo.cash',
	product_id: 9,
	volume: 1,
	is_domain_registration: false,
	item_original_cost_integer: 500,
	item_subtotal_integer: 500,
	bill_period: '365',
	months_per_bill_period: 12,
};

export const domainTransferProduct: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: '.cash Domain',
	product_slug: 'domain_transfer',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: 'foo.cash',
	product_id: 6,
	volume: 1,
	item_original_cost_integer: 500,
	item_subtotal_integer: 500,
	bill_period: '365',
	months_per_bill_period: 12,
};

export const planWithBundledDomain: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
		domain_to_bundle: 'foo.cash',
	},
	meta: '',
	product_id: 1009,
	volume: 1,
	item_original_cost_integer: 14400,
	item_subtotal_integer: 14400,
	bill_period: '365',
	months_per_bill_period: 12,
};

export const planWithoutDomain: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1009,
	volume: 1,
	item_original_cost_integer: 14400,
	item_subtotal_integer: 14400,
	bill_period: '365',
	months_per_bill_period: 12,
};

export const planWithoutDomainMonthly: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Personal Monthly',
	product_slug: 'personal-bundle-monthly',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1019,
	volume: 1,
	item_original_cost_integer: 14400,
	item_subtotal_integer: 14400,
	bill_period: '31',
	months_per_bill_period: 1,
};

export const planWithoutDomainBiannual: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Personal 2 Year',
	product_slug: 'personal-bundle-2y',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1029,
	volume: 1,
	item_original_cost_integer: 14400,
	item_subtotal_integer: 14400,
	bill_period: '730',
	months_per_bill_period: 24,
};

export const planLevel2: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Business',
	product_slug: 'business-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1008,
	volume: 1,
	item_original_cost_integer: 14400,
	item_subtotal_integer: 14400,
	bill_period: '365',
	months_per_bill_period: 12,
};

export const planLevel2Monthly: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Business Monthly',
	product_slug: 'business-bundle-monthly',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1018,
	volume: 1,
	item_original_cost_integer: 14400,
	item_subtotal_integer: 14400,
	bill_period: '31',
	months_per_bill_period: 1,
};

export const planLevel2Biannual: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Business 2 Year',
	product_slug: 'business-bundle-2y',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1028,
	volume: 1,
	item_original_cost_integer: 14400,
	item_subtotal_integer: 14400,
	bill_period: '730',
	months_per_bill_period: 24,
};
