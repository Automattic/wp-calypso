import config from '@automattic/calypso-config';
import {
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
	ResponseCartProductVariant,
} from '@automattic/shopping-cart';
import { prettyDOM } from '@testing-library/react';
import nock from 'nock';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import domainManagementReducer from 'calypso/state/domains/management/reducer';
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
} from '@automattic/wpcom-checkout';

export const stripeConfiguration = {
	processor_id: 'IE',
	js_url: 'https://stripe-js-url',
	public_key: 'stripe-public-key',
	setup_intent_id: null,
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
	},
	{
		code: 'CW',
		name: 'Curacao',
		has_postal_codes: false,
	},
	{
		code: 'AU',
		name: 'Australia',
		has_postal_codes: true,
	},
	{
		code: 'ES',
		name: 'Spain',
		has_postal_codes: true,
	},
	{
		code: 'CA',
		name: 'Canada',
		has_postal_codes: true,
	},
	{
		code: 'GB',
		name: 'United Kingdom',
		has_postal_codes: true,
	},
];

export const siteId = 13579;

export const domainProduct = {
	...getEmptyResponseCartProduct(),
	product_name: '.cash Domain',
	product_slug: 'domain_reg',
	currency: 'BRL',
	extra: {
		context: 'signup',
		domain_registration_agreement_url:
			'https://wordpress.com/automattic-domain-name-registration-agreement/',
		privacy: true,
		privacy_available: true,
		registrar: 'KS_RAM',
	},
	free_trial: false,
	meta: 'foo.cash',
	product_id: 6,
	volume: 1,
	is_domain_registration: true,
	item_original_cost_integer: 500,
	item_original_cost_display: 'R$5',
	item_subtotal_integer: 500,
	item_subtotal_display: 'R$5',
	bill_period: '365',
	months_per_bill_period: 12,
};

export const caDomainProduct = {
	...getEmptyResponseCartProduct(),
	product_name: '.ca Domain',
	product_slug: 'domain_reg',
	currency: 'BRL',
	extra: {
		context: 'signup',
		domain_registration_agreement_url:
			'https://wordpress.com/automattic-domain-name-registration-agreement/',
		privacy: true,
		privacy_available: true,
		registrar: 'KS_RAM',
	},
	free_trial: false,
	meta: 'foo.ca',
	product_id: 6,
	volume: 1,
	is_domain_registration: true,
	item_original_cost_integer: 500,
	item_original_cost_display: 'R$5',
	item_subtotal_integer: 500,
	item_subtotal_display: 'R$5',
	bill_period: '365',
	months_per_bill_period: 12,
};

export const gSuiteProduct = {
	...getEmptyResponseCartProduct(),
	product_name: 'G Suite',
	product_slug: 'gapps',
	currency: 'BRL',
	extra: {},
	free_trial: false,
	meta: 'foo.cash',
	product_id: 9,
	volume: 1,
	is_domain_registration: false,
	item_original_cost_integer: 500,
	item_original_cost_display: 'R$5',
	item_subtotal_integer: 500,
	item_subtotal_display: 'R$5',
	bill_period: '365',
	months_per_bill_period: 12,
};

export const domainTransferProduct = {
	...getEmptyResponseCartProduct(),
	product_name: '.cash Domain',
	product_slug: 'domain_transfer',
	currency: 'BRL',
	extra: {
		context: 'signup',
		domain_registration_agreement_url:
			'https://wordpress.com/automattic-domain-name-registration-agreement/',
		privacy: true,
		privacy_available: true,
		registrar: 'KS_RAM',
	},
	free_trial: false,
	meta: 'foo.cash',
	product_id: 6,
	volume: 1,
	item_original_cost_integer: 500,
	item_original_cost_display: 'R$5',
	item_subtotal_integer: 500,
	item_subtotal_display: 'R$5',
	bill_period: '365',
	months_per_bill_period: 12,
};

export const planWithBundledDomain = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
		domain_to_bundle: 'foo.cash',
	},
	free_trial: false,
	meta: '',
	product_id: 1009,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
	bill_period: '365',
	months_per_bill_period: 12,
};

export const planWithoutDomain = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1009,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
	bill_period: '365',
	months_per_bill_period: 12,
};

export const planWithoutDomainMonthly = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Personal Monthly',
	product_slug: 'personal-bundle-monthly',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1019,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
	bill_period: '31',
	months_per_bill_period: 1,
};

export const planWithoutDomainBiannual = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Personal 2 Year',
	product_slug: 'personal-bundle-2y',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1029,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
	bill_period: '730',
	months_per_bill_period: 24,
};

export const planLevel2 = {
	...getEmptyResponseCartProduct(),
	product_name: 'WordPress.com Business',
	product_slug: 'business-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1008,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
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
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
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
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
	bill_period: '730',
	months_per_bill_period: 24,
};

export const fetchStripeConfiguration = async () => stripeConfiguration;

export function mockSetCartEndpointWith( { currency, locale } ): SetCart {
	return async ( _: number, requestCart: RequestCart ) => {
		const { products: requestProducts, coupon: requestCoupon } = requestCart;
		const products = requestProducts.map( convertRequestProductToResponseProduct( currency ) );

		const taxInteger = products.reduce( ( accum, current ) => {
			return accum + current.item_tax;
		}, 0 );

		const totalInteger = products.reduce( ( accum, current ) => {
			return accum + current.item_subtotal_integer;
		}, taxInteger );

		return {
			allowed_payment_methods: [ 'WPCOM_Billing_PayPal_Express' ],
			blog_id: '1234',
			cart_generated_at_timestamp: 12345,
			cart_key: 1234,
			coupon: requestCoupon,
			coupon_discounts_integer: [],
			coupon_savings_total_display: requestCoupon ? 'R$10' : 'R$0',
			coupon_savings_total_integer: requestCoupon ? 1000 : 0,
			create_new_blog: false,
			credits_display: '0',
			credits_integer: 0,
			currency,
			is_coupon_applied: true,
			is_signup: false,
			locale,
			next_domain_is_free: false,
			products,
			sub_total_display: 'R$149',
			sub_total_integer: totalInteger - taxInteger,
			sub_total_with_taxes_display: 'R$156',
			sub_total_with_taxes_integer: totalInteger,
			tax: {
				location: requestCart.tax?.location ?? {},
				display_taxes: !! requestCart.tax?.location?.postal_code,
			},
			total_cost: 0,
			total_cost_display: 'R$156',
			total_cost_integer: totalInteger,
			total_tax: '',
			total_tax_breakdown: [],
			total_tax_display: 'R$7',
			total_tax_integer: taxInteger,
			next_domain_condition: '',
		};
	};
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
					item_original_cost_display: 'R$144',
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					bill_period: '365',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
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
					item_original_cost_display: 'R$0',
					item_subtotal_integer: 0,
					item_subtotal_display: 'R$0',
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
					item_original_cost_display: 'R$70',
					item_subtotal_integer: 70,
					item_subtotal_display: 'R$70',
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
					item_original_cost_display: 'R$70',
					item_subtotal_integer: 7000,
					item_subtotal_display: 'R$70',
					bill_period: '365',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
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
					item_original_cost_display: 'R$69',
					item_subtotal_integer: 6900,
					item_subtotal_display: 'R$69',
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
					item_original_cost_display: 'R$49',
					item_subtotal_integer: 4900,
					item_subtotal_display: 'R$49',
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
					item_original_cost_display: 'R$41',
					item_subtotal_integer: 4100,
					item_subtotal_display: 'R$41',
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
					item_original_cost_display: 'R$42',
					item_subtotal_integer: 4200,
					item_subtotal_display: 'R$42',
					bill_period: '365',
					months_per_bill_period: 12,
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
					item_original_cost_display: planLevel2.item_original_cost_display,
					item_subtotal_integer: planLevel2.item_subtotal_integer,
					item_subtotal_display: planLevel2.item_subtotal_display,
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
					item_original_cost_display: planLevel2Biannual.item_original_cost_display,
					item_subtotal_integer: planLevel2Biannual.item_subtotal_integer,
					item_subtotal_display: planLevel2Biannual.item_subtotal_display,
					bill_period: planLevel2Biannual.bill_period,
					months_per_bill_period: 24,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
		}

		return {
			...getEmptyResponseCartProduct(),
			product_id: Math.ceil( Math.random() * 3000 ),
			product_name: `Unknown mocked product: ${ product_slug }`,
			product_slug: 'unknown',
			currency: currency,
			is_domain_registration: false,
			item_subtotal_display: '$0',
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
		coupon_savings_total_display: '0',
		currency: 'BRL',
		locale: 'br-pt',
		is_coupon_applied: false,
		products: [ planWithoutDomain ],
		tax: {
			display_taxes: true,
			location: {},
		},
		allowed_payment_methods: [ 'WPCOM_Billing_PayPal_Express' ],
		total_tax_integer: 700,
		total_tax_display: 'R$7',
		total_cost_integer: 15600,
		total_cost_display: 'R$156',
		sub_total_integer: 15600,
		sub_total_display: 'R$156',
		coupon_discounts_integer: [],
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
			allowed_payment_methods: isFree
				? [ 'WPCOM_Billing_WPCOM' ]
				: [ 'WPCOM_Billing_PayPal_Express' ],
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

export function getPlansItemsState() {
	return [
		{
			product_id: planWithoutDomain.product_id,
			product_slug: planWithoutDomain.product_slug,
			bill_period: '365',
			product_type: 'bundle',
			available: true,
			price: '$48',
			formatted_price: '$48',
			raw_price: 48,
		},
		{
			product_id: planWithoutDomainMonthly.product_id,
			product_slug: planWithoutDomainMonthly.product_slug,
			bill_period: '31',
			product_type: 'bundle',
			available: true,
			price: '$7',
			formatted_price: '$7',
			raw_price: 7,
		},
		{
			product_id: planWithoutDomainBiannual.product_id,
			product_slug: planWithoutDomainBiannual.product_slug,
			bill_period: '730',
			product_type: 'bundle',
			available: true,
			price: '$84',
			formatted_price: '$84',
			raw_price: 84,
		},
		{
			product_id: planLevel2.product_id,
			product_slug: planLevel2.product_slug,
			bill_period: '365',
			product_type: 'bundle',
			available: true,
			price: '$300',
			formatted_price: '$300',
			raw_price: 300,
		},
		{
			product_id: planLevel2Monthly.product_id,
			product_slug: planLevel2Monthly.product_slug,
			bill_period: '30',
			product_type: 'bundle',
			available: true,
			price: '$33',
			formatted_price: '$33',
			raw_price: 33,
		},
		{
			product_id: planLevel2Biannual.product_id,
			product_slug: planLevel2Biannual.product_slug,
			bill_period: '730',
			product_type: 'bundle',
			available: true,
			price: '$499',
			formatted_price: '$499',
			raw_price: 499,
		},
	];
}

export function createTestReduxStore() {
	const rootReducer = ( state, action ) => {
		return {
			...state,
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
						cost_display: planWithoutDomain.item_subtotal_display,
						currency_code: planWithoutDomain.currency,
					},
					[ planWithoutDomainMonthly.product_slug ]: {
						product_id: planWithoutDomainMonthly.product_id,
						product_slug: planWithoutDomainMonthly.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						cost_display: planWithoutDomainMonthly.item_subtotal_display,
						currency_code: planWithoutDomainMonthly.currency,
					},
					[ planWithoutDomainBiannual.product_slug ]: {
						product_id: planWithoutDomainBiannual.product_id,
						product_slug: planWithoutDomainBiannual.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						cost_display: planWithoutDomainBiannual.item_subtotal_display,
						currency_code: planWithoutDomainBiannual.currency,
					},
					[ planLevel2.product_slug ]: {
						product_id: planLevel2.product_id,
						product_slug: planLevel2.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						cost_display: planLevel2.item_subtotal_display,
						currency_code: planLevel2.currency,
					},
					[ planLevel2Monthly.product_slug ]: {
						product_id: planLevel2Monthly.product_id,
						product_slug: planLevel2Monthly.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						cost_display: planLevel2Monthly.item_subtotal_display,
						currency_code: planLevel2Monthly.currency,
					},
					[ planLevel2Biannual.product_slug ]: {
						product_id: planLevel2Biannual.product_id,
						product_slug: planLevel2Biannual.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						cost_display: planLevel2Biannual.item_subtotal_display,
						currency_code: planLevel2Biannual.currency,
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
		};
	};
	return createStore( rootReducer, applyMiddleware( thunk ) );
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

export const mockTransactionsRedirectResponse = () => [
	200,
	{ redirect_url: 'https://test-redirect-url' },
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

export function mockContactDetailsValidationEndpoint(
	type: 'domain' | 'gsuite' | 'tax',
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
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );
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
		let element = null;
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
	return variantData.raw_price;
}

function buildVariant( data: ResponseCartProduct ): ResponseCartProductVariant {
	switch ( data.product_slug ) {
		case planLevel2Monthly.product_slug:
			return {
				product_id: planLevel2Monthly.product_id,
				bill_period_in_months: planLevel2Monthly.months_per_bill_period,
				product_slug: data.product_slug,
				currency: planLevel2Monthly.currency,
				price_integer: getVariantPrice( planLevel2Monthly ),
			};
		case planLevel2.product_slug:
			return {
				product_id: planLevel2.product_id,
				bill_period_in_months: planLevel2.months_per_bill_period,
				product_slug: data.product_slug,
				currency: planLevel2.currency,
				price_integer: getVariantPrice( planLevel2 ),
			};
		case planLevel2Biannual.product_slug:
			return {
				product_id: planLevel2Biannual.product_id,
				bill_period_in_months: planLevel2Biannual.months_per_bill_period,
				product_slug: data.product_slug,
				currency: planLevel2Biannual.currency,
				price_integer: getVariantPrice( planLevel2Biannual ),
			};
		case planWithoutDomainMonthly.product_slug:
			return {
				product_id: planWithoutDomainMonthly.product_id,
				bill_period_in_months: planWithoutDomainMonthly.months_per_bill_period,
				product_slug: data.product_slug,
				currency: planWithoutDomainMonthly.currency,
				price_integer: getVariantPrice( planWithoutDomainMonthly ),
			};
		case planWithoutDomain.product_slug:
			return {
				product_id: planWithoutDomain.product_id,
				bill_period_in_months: planWithoutDomain.months_per_bill_period,
				product_slug: data.product_slug,
				currency: planWithoutDomain.currency,
				price_integer: getVariantPrice( planWithoutDomain ),
			};
		case planWithoutDomainBiannual.product_slug:
			return {
				product_id: planWithoutDomainBiannual.product_id,
				bill_period_in_months: planWithoutDomainBiannual.months_per_bill_period,
				product_slug: data.product_slug,
				currency: planWithoutDomainBiannual.currency,
				price_integer: getVariantPrice( planWithoutDomainBiannual ),
			};
	}

	throw new Error( `No variants found for product_slug ${ data.product_slug }` );
}
