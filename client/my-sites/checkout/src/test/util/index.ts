import config from '@automattic/calypso-config';
import { GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY } from '@automattic/calypso-products';
import {
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
	ResponseCartProductVariant,
} from '@automattic/shopping-cart';
import { prettyDOM } from '@testing-library/react';
import nock from 'nock';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { useExperiment } from 'calypso/lib/explat';
import domainManagementReducer from 'calypso/state/domains/management/reducer';
import noticesReducer from 'calypso/state/notices/reducer';
import type { PricedAPIPlan, StorePlanSlug } from '@automattic/data-stores';
import type {
	CartKey,
	SetCart,
	RequestCart,
	ResponseCart,
	ResponseCartProduct,
	RequestCartProduct,
} from '@automattic/shopping-cart';
import type {
	CountryListItem,
	PossiblyCompleteDomainContactDetails,
	ContactDetailsType,
	WPCOMPaymentMethod,
} from '@automattic/wpcom-checkout';

jest.mock( 'calypso/lib/explat' );
( useExperiment as jest.Mock ).mockImplementation( () => [ false, undefined ] );

export const normalAllowedPaymentMethods: WPCOMPaymentMethod[] = [
	'WPCOM_Billing_PayPal_Express',
	'WPCOM_Billing_Stripe_Payment_Method',
];

export const stripeConfiguration = {
	processor_id: 'IE',
	js_url: 'https://stripe-js-url',
	public_key: 'stripe-public-key',
	setup_intent_id: undefined,
};

export const razorpayConfiguration = {
	js_url: 'https://checkout.razorpay.com/v1/checkout.js',
	options: {
		key: 'razorpay-public-key',
		config: {
			display: {
				language: 'en',
			},
		},
	},
};

export const processorOptions = {
	includeDomainDetails: false,
	includeGSuiteDetails: false,
	createUserAndSiteBeforeTransaction: false,
	stripeConfiguration,
	reduxDispatch: () => null,
	responseCart: getEmptyResponseCart(),
	getThankYouUrl: () => '/thank-you',
	siteSlug: undefined,
	siteId: undefined,
	contactDetails: undefined,
	stripe: undefined,
};

export const cachedContactDetails: PossiblyCompleteDomainContactDetails = {
	firstName: null,
	lastName: null,
	organization: null,
	email: null,
	phone: null,
	address1: null,
	address2: null,
	city: null,
	state: null,
	postalCode: null,
	countryCode: null,
	fax: null,
};

export const countryList: CountryListItem[] = [
	{
		code: 'US',
		name: 'United States',
		has_postal_codes: true,
		vat_supported: false,
	},
	{
		code: 'CW',
		name: 'Curacao',
		has_postal_codes: false,
		vat_supported: false,
	},
	{
		code: 'AU',
		name: 'Australia',
		has_postal_codes: true,
		vat_supported: false,
		tax_name: 'GST',
	},
	{
		code: 'ES',
		name: 'Spain',
		has_postal_codes: true,
		vat_supported: true,
		tax_country_codes: [ 'ES' ],
		tax_name: 'VAT',
	},
	{
		code: 'CA',
		name: 'Canada',
		has_postal_codes: true,
		tax_needs_city: true,
		tax_needs_subdivision: true,
		vat_supported: true,
		tax_country_codes: [ 'CA' ],
		tax_name: 'VAT',
	},
	{
		code: 'CH',
		name: 'Switzerland',
		has_postal_codes: true,
		tax_needs_address: true,
		vat_supported: true,
		tax_country_codes: [ 'CH' ],
		tax_name: 'GST',
	},
	{
		code: 'GB',
		name: 'United Kingdom',
		has_postal_codes: true,
		tax_needs_organization: true, // added for testing, not present in API data
		vat_supported: true,
		tax_country_codes: [ 'GB', 'XI' ],
		tax_name: 'VAT',
	},
	{
		code: 'IN',
		name: 'India',
		has_postal_codes: true,
		tax_needs_subdivision: true,
		vat_supported: false,
	},
	{
		code: 'JP',
		name: 'Japan',
		has_postal_codes: true,
		tax_needs_organization: true,
		vat_supported: false,
		tax_name: 'CT',
	},
	{
		code: 'NO',
		name: 'Norway',
		has_postal_codes: true,
		tax_needs_city: true,
		tax_needs_organization: true,
		vat_supported: false,
	},
];

export const stateList = {
	ca: [ { code: 'QC', name: 'Quebec' } ],
	in: [ { code: 'KA', name: 'Karnataka' } ],
};

export const siteId = 13579;

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

export const oneTimePurchase: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'Premium Theme',
	product_slug: 'premium_theme',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	is_one_time_purchase: true,
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

export const jetpackMonthly: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'Jetpack Scan Monthly',
	product_slug: 'jetpack_scan_monthly',
	currency: 'BRL',
	meta: '',
	product_id: 2107,
	volume: 1,
	item_original_cost_integer: 1495,
	item_subtotal_integer: 1495,
	bill_period: '31',
	months_per_bill_period: 1,
};

export const jetpackYearly: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'Jetpack Scan Yearly',
	product_slug: 'jetpack_scan',
	currency: 'BRL',
	meta: '',
	product_id: 2106,
	volume: 1,
	item_original_cost_integer: 19940,
	item_subtotal_integer: 11940,
	bill_period: '365',
	months_per_bill_period: 12,
};

export const jetpackBiannual: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'Jetpack Scan Bi-yearly',
	product_slug: 'jetpack_scan_bi_yearly',
	currency: 'BRL',
	meta: '',
	product_id: 2038,
	volume: 1,
	item_original_cost_integer: 23380,
	item_subtotal_integer: 23380,
	bill_period: '730',
	months_per_bill_period: 24,
};

export const professionalEmailAnnual: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'Professional Email',
	product_slug: 'wp_titan_mail_yearly',
	currency: 'USD',
	extra: {
		email_users: [],
		new_quantity: 1,
	},
	meta: 'example.com',
	product_id: 401,
	volume: 1,
	item_original_cost_integer: 3500,
	item_subtotal_integer: 3500,
	bill_period: '365',
	months_per_bill_period: 12,
};

export const professionalEmailMonthly: ResponseCartProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'Professional Email',
	product_slug: 'wp_titan_mail_monthly',
	currency: 'USD',
	extra: {
		email_users: [],
		new_quantity: 1,
	},
	meta: 'example.com',
	product_id: 400,
	volume: 1,
	item_original_cost_integer: 350,
	item_subtotal_integer: 350,
	bill_period: '31',
	months_per_bill_period: 1,
};

export const fetchStripeConfiguration = async () => stripeConfiguration;

export const fetchRazorpayConfiguration = async () => razorpayConfiguration;

export function mockSetCartEndpointWith( { currency, locale } ): SetCart {
	return async ( _: CartKey, requestCart: RequestCart ): Promise< ResponseCart > => {
		const { products: requestProducts, coupon: requestCoupon } = requestCart;
		const products = requestProducts.map( convertRequestProductToResponseProduct( currency ) );

		const is_gift_purchase = requestProducts.some( ( product ) => product.extra.isGiftPurchase );

		const taxInteger = products.reduce( ( accum, current ) => {
			return accum + current.item_tax;
		}, 0 );

		const totalInteger = products.reduce( ( accum, current ) => {
			return accum + current.item_subtotal_integer;
		}, taxInteger );

		return {
			is_gift_purchase,
			allowed_payment_methods: normalAllowedPaymentMethods,
			blog_id: 1234,
			cart_generated_at_timestamp: 12345,
			cart_key: 1234,
			coupon: requestCoupon,
			coupon_savings_total_integer: requestCoupon ? 1000 : 0,
			credits_integer: 0,
			currency,
			is_coupon_applied: true,
			is_signup: false,
			locale,
			next_domain_is_free: false,
			products,
			sub_total_integer: totalInteger - taxInteger,
			sub_total_with_taxes_integer: totalInteger,
			tax: {
				location: requestCart.tax?.location ?? {},
				display_taxes: !! requestCart.tax?.location?.postal_code,
			},
			total_cost: 0,
			total_cost_integer: totalInteger,
			total_tax: '',
			total_tax_breakdown: [],
			total_tax_integer: taxInteger,
			next_domain_condition: '',
			messages: { errors: [], success: [] },
		};
	};
}

export function convertProductSlugToResponseProduct( productSlug: string ): ResponseCartProduct {
	switch ( productSlug ) {
		case 'jetpack_anti_spam_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2111,
				product_name: 'Jetpack Akismet Anti-spam',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_anti_spam':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2110,
				product_name: 'Jetpack Akismet Anti-spam',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_anti_spam_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2039,
				product_name: 'Jetpack Akismet Anti-spam',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'jetpack_backup_t1_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2113,
				product_name: 'Jetpack VaultPress Backup (10GB)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_backup_t1_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2112,
				product_name: 'Jetpack VaultPress Backup (10GB)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_backup_t1_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2123,
				product_name: 'Jetpack VaultPress Backup (10GB)',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'jetpack_backup_t2_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2115,
				product_name: 'Jetpack VaultPress Backup (1TB)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_backup_t2_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2114,
				product_name: 'Jetpack VaultPress Backup (1TB)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_boost_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2400,
				product_name: 'Jetpack Boost',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_boost_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2401,
				product_name: 'Jetpack Boost',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_boost_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2036,
				product_name: 'Jetpack Boost',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'jetpack_complete_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2015,
				product_name: 'Jetpack Complete',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_complete':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2014,
				product_name: 'Jetpack Complete',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_complete_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2035,
				product_name: 'Jetpack Complete',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'jetpack_scan_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2107,
				product_name: 'Jetpack Scan',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_scan':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2106,
				product_name: 'Jetpack Scan',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_scan_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2038,
				product_name: 'Jetpack Scan',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'jetpack_search_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2105,
				product_name: 'Jetpack Search',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_search':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2104,
				product_name: 'Jetpack Search',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_search_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2131,
				product_name: 'Jetpack Search',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'jetpack_security_t1_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2017,
				product_name: 'Jetpack Security T1',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_security_t1_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2034,
				product_name: 'Jetpack Security T1',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'jetpack_security_t1_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2016,
				product_name: 'Jetpack Security T1',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_security_t2_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2020,
				product_name: 'Jetpack Security T2',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_security_t2_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2019,
				product_name: 'Jetpack Security T2',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_social_basic_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2504,
				product_name: 'Jetpack Social Basic',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_social_basic_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2503,
				product_name: 'Jetpack Social Basic',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_social_basic_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2037,
				product_name: 'Jetpack Social Basic',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'jetpack_social_advanced_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2603,
				product_name: 'Jetpack Social Advanced',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_social_advanced_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2602,
				product_name: 'Jetpack Social Advanced',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_social_advanced_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2604,
				product_name: 'Jetpack Social Advanced',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'jetpack_videopress_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2117,
				product_name: 'Jetpack VideoPress',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'jetpack_videopress_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2116,
				product_name: 'Jetpack VideoPress',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'jetpack_videopress_bi_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2119,
				product_name: 'Jetpack VideoPress',
				product_slug: productSlug,
				bill_period: 'bi-yearly',
				currency: 'USD',
			};
		case 'ak_free_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2300,
				product_name: 'Akismet Personal (Free non-commercial license)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'ak_personal_monthly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2309,
				product_name: 'Akismet Personal (Paid)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'ak_personal_yearly':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2310,
				product_name: 'Akismet Personal (Paid)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'ak_plus_monthly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2312,
				product_name: 'Akismet Pro (10K requests/month)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'ak_plus_yearly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2311,
				product_name: 'Akismet Pro (10K requests/month)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'ak_plus_monthly_2':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2314,
				product_name: 'Akismet Pro (20K requests/month)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'ak_plus_yearly_2':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2313,
				product_name: 'Akismet Pro (20K requests/month)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'ak_plus_monthly_3':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2316,
				product_name: 'Akismet Pro (30K requests/month)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'ak_plus_yearly_3':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2315,
				product_name: 'Akismet Pro (30K requests/month)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'ak_plus_monthly_4':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2318,
				product_name: 'Akismet Pro (40K requests/month)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'ak_plus_yearly_4':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2317,
				product_name: 'Akismet Pro (40K requests/month)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'ak_ent_monthly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2320,
				product_name: 'Akismet Business',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'ak_ent_yearly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2319,
				product_name: 'Akismet Business',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'ak_ep350k_monthly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2322,
				product_name: 'Akismet Enterprise (350K requests/month)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'ak_ep350k_yearly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2321,
				product_name: 'Akismet Enterprise (350K requests/month)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'ak_ep2m_monthly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2324,
				product_name: 'Akismet Enterprise (2M requests/month)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'ak_ep2m_yearly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2323,
				product_name: 'Akismet Enterprise (2M requests/month)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		case 'ak_epgt2m_monthly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2326,
				product_name: 'Akismet Enterprise (2M+ requests/month)',
				product_slug: productSlug,
				bill_period: 'monthly',
				currency: 'USD',
			};
		case 'ak_epgt2m_yearly_1':
			return {
				...getEmptyResponseCartProduct(),
				product_id: 2325,
				product_name: 'Akismet Enterprise (2M+ requests/month)',
				product_slug: productSlug,
				bill_period: 'yearly',
				currency: 'USD',
			};
		default:
			return getEmptyResponseCartProduct();
	}
}

function convertRequestProductToResponseProduct(
	currency: string
): ( product: RequestCartProduct ) => ResponseCartProduct {
	const getProductProperties = ( product ) => {
		const { product_slug } = product;

		switch ( product_slug ) {
			case 'personal-bundle': // WPCOM Personal Bundle
				return {
					...getEmptyResponseCartProduct(),
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 14400,
					item_subtotal_integer: 14400,
					bill_period: '365',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: product.extra,
				};
			case 'domain_map':
				return {
					...getEmptyResponseCartProduct(),
					product_id: 5,
					product_name: 'Domain Mapping',
					product_slug: 'domain_map',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 0,
					item_subtotal_integer: 0,
					bill_period: '365',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 'domain_reg':
				return {
					...getEmptyResponseCartProduct(),
					product_id: 6,
					product_name: 'Domain Registration',
					product_slug: 'domain_reg',
					currency: currency,
					is_domain_registration: true,
					item_original_cost_integer: 70,
					item_subtotal_integer: 70,
					bill_period: '365',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 'gapps':
				return {
					...getEmptyResponseCartProduct(),
					product_id: 9,
					product_name: 'G Suite',
					product_slug: 'gapps',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 7000,
					item_subtotal_integer: 7000,
					bill_period: '365',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY:
				return {
					...getEmptyResponseCartProduct(),
					product_id: 690,
					// Adding the quantity to the name is a hacky way to validate that it
					// is passed to the endpoint correctly.
					product_name: `Google Workspace for '${ product.meta ?? '' }' and quantity '${
						product.quantity ?? ''
					}'`,
					product_slug: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 7000,
					item_subtotal_integer: 7000,
					bill_period: '365',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					quantity: product.quantity,
					extra: {
						google_apps_users: [
							{
								email: 'foo@bar.com',
								firstname: 'Human',
								lastname: 'Person',
								recoveryEmail: 'foo@example.com',
								hash: '1234567',
								password: '1234567',
							},
						],
					},
				};
			case 'premium_theme':
				return {
					...getEmptyResponseCartProduct(),
					product_id: 39,
					product_name: 'Premium Theme: Ovation',
					product_slug: 'premium_theme',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 6900,
					item_subtotal_integer: 6900,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 'concierge-session':
				return {
					...getEmptyResponseCartProduct(),
					product_id: 371,
					product_name: 'Support Session',
					product_slug: 'concierge-session',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 4900,
					item_subtotal_integer: 4900,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 'jetpack_scan':
				return {
					...getEmptyResponseCartProduct(),
					product_id: 2106,
					product_name: 'Jetpack Scan Daily',
					product_slug: 'jetpack_scan',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 4100,
					item_subtotal_integer: 4100,
					bill_period: '365',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 'jetpack_backup_daily':
				return {
					...getEmptyResponseCartProduct(),
					product_id: 2100,
					product_name: 'Jetpack Backup (Daily)',
					product_slug: 'jetpack_backup_daily',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 4200,
					item_subtotal_integer: 4200,
					bill_period: '365',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};

			case 'ak_plus_yearly_1':
				return {
					...getEmptyResponseCartProduct(),
					product_id: 2311,
					product_name: 'Akismet Plus (10K requests/month)',
					product_slug: 'ak_plus_yearly_1',
					bill_period: '365',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 10000,
					item_subtotal_integer: 10000,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {
						isAkismetSitelessCheckout: true,
					},
				};
			case 'ak_plus_yearly_2':
				return {
					...getEmptyResponseCartProduct(),
					product_id: 2313,
					product_name: 'Akismet Plus (20K requests/month)',
					product_slug: 'ak_plus_yearly_2',
					bill_period: '365',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 20000,
					item_subtotal_integer: 20000,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {
						isAkismetSitelessCheckout: true,
					},
				};
			case jetpackMonthly.product_slug:
				return {
					...getEmptyResponseCartProduct(),
					product_id: jetpackMonthly.product_id,
					product_name: jetpackMonthly.product_name,
					product_slug: jetpackMonthly.product_slug,
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: jetpackMonthly.item_original_cost_integer,
					item_subtotal_integer: jetpackMonthly.item_subtotal_integer,
					bill_period: jetpackMonthly.bill_period,
					months_per_bill_period: jetpackMonthly.months_per_bill_period,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case jetpackYearly.product_slug:
				return {
					...getEmptyResponseCartProduct(),
					product_id: jetpackYearly.product_id,
					product_name: jetpackYearly.product_name,
					product_slug: jetpackYearly.product_slug,
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: jetpackYearly.item_original_cost_integer,
					item_subtotal_integer: jetpackYearly.item_subtotal_integer,
					bill_period: jetpackYearly.bill_period,
					months_per_bill_period: jetpackYearly.months_per_bill_period,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case jetpackBiannual.product_slug:
				return {
					...getEmptyResponseCartProduct(),
					product_id: jetpackBiannual.product_id,
					product_name: jetpackBiannual.product_name,
					product_slug: jetpackBiannual.product_slug,
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: jetpackBiannual.item_original_cost_integer,
					item_subtotal_integer: jetpackBiannual.item_subtotal_integer,
					bill_period: jetpackBiannual.bill_period,
					months_per_bill_period: jetpackBiannual.months_per_bill_period,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case planLevel2.product_slug:
				return {
					...getEmptyResponseCartProduct(),
					product_id: planLevel2.product_id,
					product_name: planLevel2.product_name,
					product_slug: planLevel2.product_slug,
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: planLevel2.item_original_cost_integer,
					item_subtotal_integer: planLevel2.item_subtotal_integer,
					bill_period: planLevel2.bill_period,
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case planLevel2Biannual.product_slug:
				return {
					...getEmptyResponseCartProduct(),
					product_id: planLevel2Biannual.product_id,
					product_name: planLevel2Biannual.product_name,
					product_slug: planLevel2Biannual.product_slug,
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: planLevel2Biannual.item_original_cost_integer,
					item_subtotal_integer: planLevel2Biannual.item_subtotal_integer,
					bill_period: planLevel2Biannual.bill_period,
					months_per_bill_period: 24,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case professionalEmailAnnual.product_slug:
				return {
					...getEmptyResponseCartProduct(),
					product_id: professionalEmailAnnual.product_id,
					product_name: professionalEmailAnnual.product_name,
					product_slug: professionalEmailAnnual.product_slug,
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: professionalEmailAnnual.item_original_cost_integer,
					item_subtotal_integer: professionalEmailAnnual.item_subtotal_integer,
					bill_period: professionalEmailAnnual.bill_period,
					months_per_bill_period: professionalEmailAnnual.months_per_bill_period,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: product.extra,
				};
			case professionalEmailMonthly.product_slug:
				return {
					...getEmptyResponseCartProduct(),
					product_id: professionalEmailMonthly.product_id,
					product_name: professionalEmailMonthly.product_name,
					product_slug: professionalEmailMonthly.product_slug,
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: professionalEmailMonthly.item_original_cost_integer,
					item_subtotal_integer: professionalEmailMonthly.item_subtotal_integer,
					bill_period: professionalEmailMonthly.bill_period,
					months_per_bill_period: professionalEmailMonthly.months_per_bill_period,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: product.extra,
				};
		}

		return {
			...getEmptyResponseCartProduct(),
			product_id: Math.ceil( Math.random() * 3000 ),
			product_name: `Unknown mocked product: ${ product_slug }`,
			product_slug: 'unknown',
			currency: currency,
			is_domain_registration: false,
			item_subtotal_integer: 0,
			item_tax: 0,
		};
	};

	return ( product ) => addVariantsToCartItem( getProductProperties( product ) );
}

export function getBasicCart(): ResponseCart {
	const cart = getEmptyResponseCart();
	return {
		...cart,
		coupon: '',
		coupon_savings_total_integer: 0,
		currency: 'BRL',
		locale: 'br-pt',
		is_coupon_applied: false,
		products: [ planWithoutDomain ],
		tax: {
			display_taxes: true,
			location: {},
		},
		allowed_payment_methods: normalAllowedPaymentMethods,
		total_tax_integer: 700,
		total_cost_integer: 15600,
		sub_total_integer: 15600,
	};
}

export function mockCartEndpoint( initialCart: ResponseCart, currency: string, locale: string ) {
	let cart = initialCart;
	const mockSetCart = mockSetCartEndpointWith( { currency, locale } );
	const setCart = async ( cartKey: CartKey, val: RequestCart ) => {
		cart = await mockSetCart( cartKey, val );
		return cart;
	};

	return {
		getCart: async () => cart,
		setCart,
	};
}

export function mockGetCartEndpointWith( initialCart: ResponseCart ) {
	return async () => {
		const isFree =
			initialCart.total_cost_integer === 0 ||
			initialCart.credits_integer >= initialCart.total_cost_integer;
		return {
			...initialCart,
			allowed_payment_methods: isFree ? [ 'WPCOM_Billing_WPCOM' ] : normalAllowedPaymentMethods,
		};
	};
}

export function getActivePersonalPlanDataForType( type: string ) {
	switch ( type ) {
		case 'none':
			return null;
		case 'monthly':
			return [
				{
					interval: 30,
					productSlug: planWithoutDomainMonthly.product_slug,
					currentPlan: true,
				},
			];
		case 'yearly':
			return [
				{
					interval: 365,
					productSlug: planWithoutDomain.product_slug,
					currentPlan: true,
				},
			];
		case 'two-year':
			return [
				{
					interval: 730,
					productSlug: planWithoutDomainBiannual.product_slug,
					currentPlan: true,
				},
			];
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

export function getPersonalPlanForInterval( type: string ) {
	switch ( type ) {
		case 'monthly':
			return addVariantsToCartItem( planWithoutDomainMonthly );
		case 'yearly':
			return addVariantsToCartItem( planWithoutDomain );
		case 'two-year':
			return addVariantsToCartItem( planWithoutDomainBiannual );
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

export function getBusinessPlanForInterval( type: string ) {
	switch ( type ) {
		case 'monthly':
			return addVariantsToCartItem( planLevel2Monthly );
		case 'yearly':
			return addVariantsToCartItem( planLevel2 );
		case 'two-year':
			return addVariantsToCartItem( planLevel2Biannual );
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

export function getJetpackPlanForInterval( type: string ) {
	switch ( type ) {
		case 'monthly':
			return addVariantsToCartItem( jetpackMonthly );
		case 'yearly':
			return addVariantsToCartItem( jetpackYearly );
		case 'two-year':
			return addVariantsToCartItem( jetpackBiannual );
	}
}

export function getVariantItemTextForInterval( type: string ) {
	switch ( type ) {
		case 'monthly':
			return /One month/;
		case 'yearly':
			return /One year/;
		case 'two-year':
			return /Two years/;
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

export function getPlanSubtitleTextForInterval( type: string ) {
	switch ( type ) {
		case 'monthly':
			return /per month/;
		case 'yearly':
			return /per year/;
		case 'two-year':
			return /per two years/;
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

export function getPlansItemsState(): PricedAPIPlan[] {
	return [
		{
			product_id: planWithoutDomain.product_id,
			product_slug: planWithoutDomain.product_slug as StorePlanSlug,
			product_name: planWithoutDomain.product_name,
			product_name_short: planWithoutDomain.product_name,
			currency_code: 'USD',
			bill_period: 365,
			product_type: 'bundle',
			raw_price: 48,
			raw_price_integer: 4800,
			orig_cost_integer: 4800,
		},
		{
			product_id: planWithoutDomainMonthly.product_id,
			product_slug: planWithoutDomainMonthly.product_slug as StorePlanSlug,
			product_name: planWithoutDomainMonthly.product_name,
			product_name_short: planWithoutDomainMonthly.product_name,
			currency_code: 'USD',
			bill_period: 31,
			product_type: 'bundle',
			raw_price: 7,
			raw_price_integer: 700,
			orig_cost_integer: 700,
		},
		{
			product_id: planWithoutDomainBiannual.product_id,
			product_slug: planWithoutDomainBiannual.product_slug as StorePlanSlug,
			product_name: planWithoutDomainBiannual.product_name,
			product_name_short: planWithoutDomainBiannual.product_name,
			currency_code: 'USD',
			bill_period: 730,
			product_type: 'bundle',
			raw_price: 84,
			raw_price_integer: 8400,
			orig_cost_integer: 8400,
		},
		{
			product_id: planLevel2.product_id,
			product_slug: planLevel2.product_slug as StorePlanSlug,
			product_name: planLevel2.product_name,
			product_name_short: planLevel2.product_name,
			currency_code: 'USD',
			bill_period: 365,
			product_type: 'bundle',
			raw_price: 300,
			raw_price_integer: 30000,
			orig_cost_integer: 30000,
		},
		{
			product_id: planLevel2Monthly.product_id,
			product_slug: planLevel2Monthly.product_slug as StorePlanSlug,
			product_name: planLevel2Monthly.product_name,
			product_name_short: planLevel2Monthly.product_name,
			currency_code: 'USD',
			bill_period: 31,
			product_type: 'bundle',
			raw_price: 33,
			raw_price_integer: 3300,
			orig_cost_integer: 3300,
		},
		{
			product_id: planLevel2Biannual.product_id,
			product_slug: planLevel2Biannual.product_slug as StorePlanSlug,
			product_name: planLevel2Biannual.product_name,
			product_name_short: planLevel2Biannual.product_name,
			currency_code: 'USD',
			bill_period: 730,
			product_type: 'bundle',
			raw_price: 499,
			raw_price_integer: 49900,
			orig_cost_integer: 49900,
		},
		{
			product_id: jetpackMonthly.product_id,
			product_slug: jetpackMonthly.product_slug as StorePlanSlug,
			product_name: jetpackMonthly.product_name,
			product_name_short: jetpackMonthly.product_name,
			currency_code: 'BRL',
			bill_period: 31,
			product_type: 'product',
			raw_price: 14.95,
			raw_price_integer: 1495,
			orig_cost_integer: 1495,
		},
		{
			product_id: jetpackYearly.product_id,
			product_slug: jetpackYearly.product_slug as StorePlanSlug,
			product_name: jetpackYearly.product_name,
			product_name_short: jetpackYearly.product_name,
			currency_code: 'BRL',
			bill_period: 365,
			product_type: 'product',
			raw_price: 119.4,
			raw_price_integer: 11940,
			orig_cost_integer: 11940,
		},
		{
			product_id: jetpackBiannual.product_id,
			product_slug: jetpackBiannual.product_slug as StorePlanSlug,
			product_name: jetpackBiannual.product_name,
			product_name_short: jetpackBiannual.product_name,
			currency_code: 'BRL',
			bill_period: 730,
			product_type: 'product',
			raw_price: 238.8,
			raw_price_integer: 23880,
			orig_cost_integer: 23880,
		},
	];
}

export function createTestReduxStore() {
	const rootReducer = ( state, action ) => {
		return {
			...state,
			notices: noticesReducer( state, action ),
			plans: {
				items: getPlansItemsState(),
			},
			sites: { items: {} },
			siteSettings: { items: {} },
			ui: { selectedSiteId: siteId },
			productsList: {
				items: {
					[ planWithoutDomain.product_slug ]: {
						product_id: planWithoutDomain.product_id,
						product_slug: planWithoutDomain.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						currency_code: planWithoutDomain.currency,
					},
					[ planWithoutDomainMonthly.product_slug ]: {
						product_id: planWithoutDomainMonthly.product_id,
						product_slug: planWithoutDomainMonthly.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						currency_code: planWithoutDomainMonthly.currency,
					},
					[ planWithoutDomainBiannual.product_slug ]: {
						product_id: planWithoutDomainBiannual.product_id,
						product_slug: planWithoutDomainBiannual.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						currency_code: planWithoutDomainBiannual.currency,
					},
					[ planLevel2.product_slug ]: {
						product_id: planLevel2.product_id,
						product_slug: planLevel2.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						currency_code: planLevel2.currency,
					},
					[ planLevel2Monthly.product_slug ]: {
						product_id: planLevel2Monthly.product_id,
						product_slug: planLevel2Monthly.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						currency_code: planLevel2Monthly.currency,
					},
					[ planLevel2Biannual.product_slug ]: {
						product_id: planLevel2Biannual.product_id,
						product_slug: planLevel2Biannual.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						currency_code: planLevel2Biannual.currency,
					},
					[ jetpackMonthly.product_slug ]: {
						product_id: jetpackMonthly.product_id,
						product_slug: jetpackMonthly.product_slug,
						product_type: 'product',
						available: true,
						is_domain_registration: false,
						currency_code: jetpackMonthly.currency,
					},
					[ jetpackYearly.product_slug ]: {
						product_id: jetpackYearly.product_id,
						product_slug: jetpackYearly.product_slug,
						product_type: 'product',
						available: true,
						is_domain_registration: false,
						currency_code: jetpackYearly.currency,
					},
					[ jetpackBiannual.product_slug ]: {
						product_id: jetpackBiannual.product_id,
						product_slug: jetpackBiannual.product_slug,
						product_type: 'product',
						available: true,
						is_domain_registration: false,
						currency_code: jetpackBiannual.currency,
					},
					domain_map: {
						product_id: 5,
						product_name: 'Product',
						product_slug: 'domain_map',
					},
					domain_reg: {
						product_id: 6,
						product_name: 'Product',
						product_slug: 'domain_reg',
					},
					premium_theme: {
						product_id: 39,
						product_name: 'Product',
						product_slug: 'premium_theme',
					},
					'concierge-session': {
						product_id: 371,
						product_name: 'Product',
						product_slug: 'concierge-session',
					},
					jetpack_backup_daily: {
						product_id: 2100,
						product_name: 'Jetpack Backup (Daily)',
						product_slug: 'jetpack_backup_daily',
					},
					jetpack_scan: {
						product_id: 2106,
						product_name: 'Jetpack Scan Daily',
						product_slug: 'jetpack_scan',
					},
				},
			},
			purchases: {},
			countries: { payments: countryList, domains: countryList },
			domains: { management: domainManagementReducer( state?.domains?.management ?? {}, action ) },
			countryStates: { items: stateList },
		};
	};
	return createStore( rootReducer, applyMiddleware( thunk ) );
}

export function mockGetSupportedCountriesEndpoint( response: CountryListItem[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/transactions/supported-countries' )
		.reply( 200, response );
}

export function mockGetVatInfoEndpoint( response ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/vat-info' )
		.optionally()
		.reply( 200, response );
}

export function mockLogStashEndpoint() {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/logstash', ( body ) => {
			return endpoint( body );
		} )
		.reply( 200 );
	return endpoint;
}

export function mockSetVatInfoEndpoint() {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/vat-info', ( body ) => {
			return endpoint( body );
		} )
		.reply( 200 );
	return endpoint;
}

export function mockUserSignupValidationEndpoint( endpointResponse ) {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/signups/validation/user/', ( body ) => {
			return endpoint( body );
		} )
		.reply( endpointResponse );
	return endpoint;
}

export function mockPayPalEndpoint( endpointResponse ) {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.2/me/paypal-express-url', ( body ) => {
			return endpoint( body );
		} )
		.reply( endpointResponse );
	return endpoint;
}

export const mockPayPalRedirectResponse = () => [
	200,
	{ redirect_url: 'https://test-redirect-url' },
];

export function mockGetPaymentMethodsEndpoint( endpointResponse ) {
	nock( 'https://public-api.wordpress.com' )
		.get( /\/rest\/v1\.2\/me\/payment-methods/ )
		.reply( 200, endpointResponse );
}

export function mockCreateAccountEndpoint( endpointResponse ) {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/users/new', ( body ) => {
			return endpoint( body );
		} )
		.reply( endpointResponse );
	return endpoint;
}

export function mockOrderEndpoint( orderId: number, endpointResponse ) {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/transactions/order/' + orderId, ( body ) => {
			return endpoint( body );
		} )
		.reply( endpointResponse );
	return endpoint;
}

export function mockTransactionsEndpoint( transactionsEndpointResponse ) {
	const transactionsEndpoint = jest.fn();
	transactionsEndpoint.mockReturnValue( true );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/transactions', ( body ) => {
			return transactionsEndpoint( body );
		} )
		.reply( transactionsEndpointResponse );

	return transactionsEndpoint;
}

export function setMockLocation( href: string ) {
	const url = new URL( href );
	jest.spyOn( window, 'location', 'get' ).mockReturnValue( url );
}

export const mockCreateAccountSiteNotCreatedResponse = () => [ 200, { success: true } ];

export const mockCreateAccountSiteCreatedResponse = () => [
	200,
	{
		success: true,
		blog_details: {
			blogid: 1234567,
		},
	},
];

export const mockTransactionsRedirectResponse = ( orderId?: number ) => [
	200,
	{ redirect_url: 'https://test-redirect-url', order_id: orderId },
];

export const mockTransactionsSuccessResponse = () => [ 200, { success: 'true' } ];

function getManagedValueFromString( value ) {
	return { isTouched: true, value, errors: [] };
}

function getStringFromManagedValue( managedValue ) {
	return managedValue.value;
}

export const countryCode = getManagedValueFromString( 'US' );
export const postalCode = getManagedValueFromString( '10001' );
export const address1 = getManagedValueFromString( '100 Main Street' );
export const city = getManagedValueFromString( 'Rando city' );
export const state = getManagedValueFromString( 'NY' );
export const firstName = getManagedValueFromString( 'Human' );
export const lastName = getManagedValueFromString( 'Person' );
export const phone = getManagedValueFromString( '+1.5555555555' );
export const email = getManagedValueFromString( 'test@example.com' );

export const contactDetailsForDomain = {
	countryCode,
	postalCode,
	address1,
	city,
	state,
	firstName,
	lastName,
	phone,
};

export const basicExpectedDomainDetails = {
	address_1: getStringFromManagedValue( address1 ),
	address_2: undefined,
	city: getStringFromManagedValue( city ),
	country_code: getStringFromManagedValue( countryCode ),
	email: undefined,
	extra: {
		ca: null,
		fr: null,
		uk: null,
	},
	fax: undefined,
	first_name: getStringFromManagedValue( firstName ),
	last_name: getStringFromManagedValue( lastName ),
	organization: undefined,
	phone: getStringFromManagedValue( phone ),
	postal_code: getStringFromManagedValue( postalCode ),
	state: getStringFromManagedValue( state ),
};

export const expectedCreateAccountRequest = {
	email: getStringFromManagedValue( email ),
	'g-recaptcha-error': 'recaptcha_didnt_load',
	'g-recaptcha-response': undefined,
	is_passwordless: true,
	extra: {},
	signup_flow_name: 'onboarding-registrationless',
	validate: false,
	new_site_params: {},
	should_create_site: true,
	locale: 'en',
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
	tos: {
		locale: 'en',
		path: '/',
		viewport: '0x0',
	},
};

export function mockCachedContactDetailsEndpoint( responseData ): void {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );
	const mockDomainContactResponse = () => [ 200, responseData ];
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/domain-contact-information' )
		.reply( mockDomainContactResponse );
}

export function mockSetCachedContactDetailsEndpoint() {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );
	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/domain-contact-information', ( body ) => {
			return endpoint( body );
		} )
		.reply( 200 );
	return endpoint;
}

export function mockContactDetailsValidationEndpoint(
	type: Exclude< ContactDetailsType, 'none' >,
	responseData,
	conditionCallback?: ( body ) => boolean
): void {
	const endpointPath = ( () => {
		switch ( type ) {
			case 'tax':
				return '/rest/v1.1/me/tax-contact-information/validate';
			case 'domain':
				return '/rest/v1.2/me/domain-contact-information/validate';
			case 'gsuite':
				return '/rest/v1.1/me/google-apps/validate';
		}
	} )();
	const mockResponse = () => [ 200, responseData ];
	nock( 'https://public-api.wordpress.com' )
		.post( endpointPath, conditionCallback )
		.reply( mockResponse );
}

export function mockMatchMediaOnWindow(): void {
	Object.defineProperty( window, 'matchMedia', {
		writable: true,
		value: jest.fn().mockImplementation( ( query ) => ( {
			matches: false,
			media: query,
			onchange: null,
			addListener: jest.fn(), // deprecated
			removeListener: jest.fn(), // deprecated
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
		} ) ),
	} );
}

// Add the below custom Jest assertion to TypeScript.
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace jest {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface Matchers< R > {
			toNeverAppear(): Promise< CustomMatcherResult >;
		}
	}
}

expect.extend( {
	/**
	 * Assert that a DOM element never appears, even after some time passes.
	 *
	 * The argument should be a call to one of testing-library's `findBy...`
	 * methods which will throw if they do not find a result.
	 *
	 * This is an async matcher so you must await its result.
	 *
	 * Example:
	 * `await expect( screen.findByText( 'Bad things' ) ).toNeverAppear();`
	 *
	 * This is a little tricky because we need to keep checking over time, so we
	 * use this slightly convoluted technique:
	 * https://stackoverflow.com/a/68318058/2615868
	 */
	async toNeverAppear( elementPromise: Promise< HTMLElement > ) {
		let pass = false;
		let element: HTMLElement | null = null;
		try {
			element = await elementPromise;
		} catch {
			pass = true;
		}
		if ( pass ) {
			return {
				message: () => `expected element to appear but it did not.`,
				pass: true,
			};
		}
		const elementPretty = element ? prettyDOM( element ) : '';
		return {
			message: () => `expected element to never appear but it did:\n${ elementPretty }`,
			pass: false,
		};
	},
} );

export function mockUserAgent( agent ) {
	Object.defineProperty( window.navigator, 'userAgent', {
		get() {
			return agent;
		},
	} );
}

function addVariantsToCartItem( data: ResponseCartProduct ): ResponseCartProduct {
	return {
		...data,
		product_variants: buildVariantsForCartItem( data ),
	};
}

function buildVariantsForCartItem( data: ResponseCartProduct ): ResponseCartProductVariant[] {
	switch ( data.product_slug ) {
		case planLevel2Monthly.product_slug:
		case planLevel2.product_slug:
		case planLevel2Biannual.product_slug:
			return [
				buildVariant( planLevel2Monthly ),
				buildVariant( planLevel2 ),
				buildVariant( planLevel2Biannual ),
			];
		case planWithoutDomainMonthly.product_slug:
		case planWithoutDomain.product_slug:
		case planWithoutDomainBiannual.product_slug:
			return [
				buildVariant( planWithoutDomainMonthly ),
				buildVariant( planWithoutDomain ),
				buildVariant( planWithoutDomainBiannual ),
			];
		case jetpackMonthly.product_slug:
		case jetpackYearly.product_slug:
		case jetpackBiannual.product_slug:
			return [
				buildVariant( jetpackMonthly ),
				buildVariant( jetpackYearly ),
				buildVariant( jetpackBiannual ),
			];
	}
	return [];
}

function getVariantPrice( data: ResponseCartProduct ): number {
	const variantData = getPlansItemsState().find(
		( plan ) => plan.product_slug === data.product_slug
	);
	if ( ! variantData ) {
		throw new Error( `Unknown price for variant ${ data.product_slug }` );
	}
	return variantData.raw_price_integer;
}

function buildVariant( data: ResponseCartProduct ): ResponseCartProductVariant {
	switch ( data.product_slug ) {
		case jetpackMonthly.product_slug:
			return {
				product_id: jetpackMonthly.product_id,
				bill_period_in_months: jetpackMonthly.months_per_bill_period as number,
				product_slug: data.product_slug,
				currency: jetpackMonthly.currency,
				price_integer: getVariantPrice( jetpackMonthly ) / 2,
				price_before_discounts_integer: getVariantPrice( jetpackMonthly ),
				introductory_offer_terms: {},
			};
		case jetpackYearly.product_slug:
			return {
				product_id: jetpackYearly.product_id,
				bill_period_in_months: jetpackYearly.months_per_bill_period as number,
				product_slug: data.product_slug,
				currency: jetpackYearly.currency,
				price_integer: getVariantPrice( jetpackYearly ) / 2,
				price_before_discounts_integer: getVariantPrice( jetpackYearly ),
				introductory_offer_terms: {},
			};
		case jetpackBiannual.product_slug:
			return {
				product_id: jetpackBiannual.product_id,
				bill_period_in_months: jetpackBiannual.months_per_bill_period as number,
				product_slug: data.product_slug,
				currency: jetpackBiannual.currency,
				price_integer: getVariantPrice( jetpackBiannual ) / 2,
				price_before_discounts_integer: getVariantPrice( jetpackBiannual ),
				introductory_offer_terms: {},
			};
		case planLevel2Monthly.product_slug:
			return {
				product_id: planLevel2Monthly.product_id,
				bill_period_in_months: planLevel2Monthly.months_per_bill_period as number,
				product_slug: data.product_slug,
				currency: planLevel2Monthly.currency,
				price_integer: getVariantPrice( planLevel2Monthly ),
				price_before_discounts_integer: getVariantPrice( planLevel2Monthly ),
				introductory_offer_terms: {},
			};
		case planLevel2.product_slug:
			return {
				product_id: planLevel2.product_id,
				bill_period_in_months: planLevel2.months_per_bill_period as number,
				product_slug: data.product_slug,
				currency: planLevel2.currency,
				price_integer: getVariantPrice( planLevel2 ),
				price_before_discounts_integer: getVariantPrice( planLevel2 ),
				introductory_offer_terms: {},
			};
		case planLevel2Biannual.product_slug:
			return {
				product_id: planLevel2Biannual.product_id,
				bill_period_in_months: planLevel2Biannual.months_per_bill_period as number,
				product_slug: data.product_slug,
				currency: planLevel2Biannual.currency,
				price_integer: getVariantPrice( planLevel2Biannual ),
				price_before_discounts_integer: getVariantPrice( planLevel2Biannual ),
				introductory_offer_terms: {},
			};
		case planWithoutDomainMonthly.product_slug:
			return {
				product_id: planWithoutDomainMonthly.product_id,
				bill_period_in_months: planWithoutDomainMonthly.months_per_bill_period as number,
				product_slug: data.product_slug,
				currency: planWithoutDomainMonthly.currency,
				price_integer: getVariantPrice( planWithoutDomainMonthly ),
				price_before_discounts_integer: getVariantPrice( planWithoutDomainMonthly ),
				introductory_offer_terms: {},
			};
		case planWithoutDomain.product_slug:
			return {
				product_id: planWithoutDomain.product_id,
				bill_period_in_months: planWithoutDomain.months_per_bill_period as number,
				product_slug: data.product_slug,
				currency: planWithoutDomain.currency,
				price_integer: getVariantPrice( planWithoutDomain ),
				price_before_discounts_integer: getVariantPrice( planWithoutDomain ),
				introductory_offer_terms: {},
			};
		case planWithoutDomainBiannual.product_slug:
			return {
				product_id: planWithoutDomainBiannual.product_id,
				bill_period_in_months: planWithoutDomainBiannual.months_per_bill_period as number,
				product_slug: data.product_slug,
				currency: planWithoutDomainBiannual.currency,
				price_integer: getVariantPrice( planWithoutDomainBiannual ),
				price_before_discounts_integer: getVariantPrice( planWithoutDomainBiannual ),
				introductory_offer_terms: {},
			};
	}

	throw new Error( `No variants found for product_slug ${ data.product_slug }` );
}

/**
 * Helper to prepare to mock Stripe Elements.
 *
 * To use this, you'll need to call it inside `jest.mock()` as follows:
 *
 * ```
 * jest.mock( '@stripe/react-stripe-js', () => {
 *   const stripe = jest.requireActual( '@stripe/react-stripe-js' );
 *   return { ...stripe, ...mockStripeElements() };
 * } );
 *
 * jest.mock( '@stripe/stripe-js', () => {
 *   return {
 *     loadStripe: async () => mockStripeElements().useStripe(),
 *   };
 * } );
 * ```
 */
export function mockStripeElements() {
	const mockElement = () => ( {
		mount: jest.fn(),
		destroy: jest.fn(),
		on: jest.fn(),
		off: jest.fn(),
		update: jest.fn(),
	} );

	const mockElements = () => {
		const elements = {};
		return {
			create: jest.fn( ( type ) => {
				elements[ type ] = mockElement();
				return elements[ type ];
			} ),
			getElement: jest.fn( ( type ) => {
				return elements[ type ] || null;
			} ),
		};
	};

	const mockStripe = () => ( {
		elements: jest.fn( () => mockElements() ),
		createToken: jest.fn(),
		createSource: jest.fn(),
		createPaymentMethod: jest.fn(),
		confirmCardPayment: jest.fn(),
		confirmCardSetup: jest.fn(),
		paymentRequest: jest.fn(),
		_registerWrapper: jest.fn(),
	} );

	return {
		Element: () => {
			return mockElement();
		},
		useStripe: () => {
			return mockStripe();
		},
		useElements: () => {
			return mockElements();
		},
	};
}
