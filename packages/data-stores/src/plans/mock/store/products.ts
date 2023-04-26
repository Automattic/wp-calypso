import type { PlanProduct } from '../../types';

// Plan products
export const STORE_PRODUCT_FREE: PlanProduct = {
	productId: 1,
	billingPeriod: 'ANNUALLY',
	billingTerm: null,
	periodAgnosticSlug: 'free',
	storeSlug: 'free_plan',
	pathSlug: 'free',
	rawPrice: 0,
	price: '€0',
	annualPrice: '€0',
};
export const STORE_PRODUCT_PREMIUM_ANNUALLY: PlanProduct = {
	productId: 1003,
	annualDiscount: 42,
	billingPeriod: 'ANNUALLY',
	billingTerm: 'TERM_ANNUALLY',
	periodAgnosticSlug: 'premium',
	storeSlug: 'value_bundle',
	pathSlug: 'premium',
	rawPrice: 96,
	price: '€8',
	annualPrice: '€96',
};
export const STORE_PRODUCT_PREMIUM_MONTHLY: PlanProduct = {
	productId: 1013,
	annualDiscount: 42,
	billingPeriod: 'MONTHLY',
	billingTerm: 'TERM_MONTHLY',
	periodAgnosticSlug: 'premium',
	storeSlug: 'value_bundle_monthly',
	pathSlug: undefined,
	rawPrice: 14,
	price: '€14',
	annualPrice: '€168',
};
