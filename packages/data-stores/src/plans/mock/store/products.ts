import type { PlanProduct } from '../../types';

// Plan products
export const STORE_PRODUCT_FREE: PlanProduct = {
	productId: 1,
	billingPeriod: 'ANNUALLY',
	periodAgnosticSlug: 'free',
	storeSlug: 'free_plan',
	rawPrice: 0,
	pathSlug: 'free',
	price: '€0',
	annualPrice: '€0',
};
export const STORE_PRODUCT_PREMIUM_ANNUALLY: PlanProduct = {
	productId: 1003,
	billingPeriod: 'ANNUALLY',
	periodAgnosticSlug: 'premium',
	storeSlug: 'value_bundle',
	rawPrice: 96,
	pathSlug: 'premium',
	price: '€8',
	annualPrice: '€96',
	annualDiscount: 42,
};
export const STORE_PRODUCT_PREMIUM_MONTHLY: PlanProduct = {
	productId: 1013,
	billingPeriod: 'MONTHLY',
	periodAgnosticSlug: 'premium',
	storeSlug: 'value_bundle_monthly',
	rawPrice: 14,
	price: '€14',
	annualPrice: '€168',
	annualDiscount: 42,
};
