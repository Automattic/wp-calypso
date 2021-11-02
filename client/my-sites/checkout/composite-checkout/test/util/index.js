import { getEmptyResponseCart } from '@automattic/shopping-cart';
import nock from 'nock';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

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
	recordEvent: () => null,
	reduxDispatch: () => null,
	responseCart: getEmptyResponseCart(),
	getThankYouUrl: () => '',
	siteSlug: undefined,
	siteId: undefined,
	contactDetails: undefined,
	stripe: undefined,
};

export const countryList = [
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
];

export const siteId = 13579;

export const domainProduct = {
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
};

export const caDomainProduct = {
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
};

export const gSuiteProduct = {
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
};

export const domainTransferProduct = {
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
};

export const planWithBundledDomain = {
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
};

export const planWithoutDomain = {
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
};

export const planWithoutDomainMonthly = {
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
};

export const planWithoutDomainBiannual = {
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
};

export const planLevel2 = {
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
};

export const planLevel2Monthly = {
	product_name: 'WordPress.com Business Monthly',
	product_slug: 'business-bundle-monthly',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1018,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

export const planLevel2Biannual = {
	product_name: 'WordPress.com Business 2 Year',
	product_slug: 'business-bundle-2y',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1028,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

export const fetchStripeConfiguration = async () => {
	return {
		public_key: 'abc123',
		js_url: 'https://js.stripe.com/v3/',
	};
};

export async function mockSetCartEndpoint( _, requestCart ) {
	const {
		products: requestProducts,
		currency: requestCurrency,
		coupon: requestCoupon,
		locale: requestLocale,
	} = requestCart;
	const products = requestProducts.map( convertRequestProductToResponseProduct( requestCurrency ) );

	const taxInteger = products.reduce( ( accum, current ) => {
		return accum + current.item_tax;
	}, 0 );

	const totalInteger = products.reduce( ( accum, current ) => {
		return accum + current.item_subtotal_integer;
	}, taxInteger );

	return {
		products,
		locale: requestLocale,
		currency: requestCurrency,
		credits_integer: 0,
		credits_display: '0',
		allowed_payment_methods: [ 'WPCOM_Billing_PayPal_Express' ],
		coupon_savings_total_display: requestCoupon ? 'R$10' : 'R$0',
		coupon_savings_total_integer: requestCoupon ? 1000 : 0,
		savings_total_display: requestCoupon ? 'R$10' : 'R$0',
		savings_total_integer: requestCoupon ? 1000 : 0,
		total_tax_display: 'R$7',
		total_tax_integer: taxInteger,
		total_cost_display: 'R$156',
		total_cost_integer: totalInteger,
		sub_total_display: 'R$149',
		sub_total_integer: totalInteger - taxInteger,
		coupon: requestCoupon,
		is_coupon_applied: true,
		coupon_discounts_integer: [],
		tax: { location: {}, display_taxes: true },
	};
}

function convertRequestProductToResponseProduct( currency ) {
	return ( product ) => {
		const { product_id } = product;

		switch ( product_id ) {
			case 1009: // WPCOM Personal Bundle
				return {
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 14400,
					item_original_cost_display: 'R$144',
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 5:
				return {
					product_id: 5,
					product_name: 'Domain Mapping',
					product_slug: 'domain_map',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 0,
					item_original_cost_display: 'R$0',
					item_subtotal_integer: 0,
					item_subtotal_display: 'R$0',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 6:
				return {
					product_id: 6,
					product_name: 'Domain Registration',
					product_slug: 'domain_reg',
					currency: currency,
					is_domain_registration: true,
					item_original_cost_integer: 70,
					item_original_cost_display: 'R$70',
					item_subtotal_integer: 70,
					item_subtotal_display: 'R$70',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 9:
				return {
					product_id: 9,
					product_name: 'G Suite',
					product_slug: 'gapps',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 70,
					item_original_cost_display: 'R$70',
					item_subtotal_integer: 70,
					item_subtotal_display: 'R$70',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 39:
				return {
					product_id: 39,
					product_name: 'Premium Theme: Ovation',
					product_slug: 'premium_theme',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 69,
					item_original_cost_display: 'R$69',
					item_subtotal_integer: 69,
					item_subtotal_display: 'R$69',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 371:
				return {
					product_id: 371,
					product_name: 'Support Session',
					product_slug: 'concierge-session',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 49,
					item_original_cost_display: 'R$49',
					item_subtotal_integer: 49,
					item_subtotal_display: 'R$49',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 2106:
				return {
					product_id: 2106,
					product_name: 'Jetpack Scan Daily',
					product_slug: 'jetpack_scan',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 4100,
					item_original_cost_display: 'R$41',
					item_subtotal_integer: 4100,
					item_subtotal_display: 'R$41',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 2100:
				return {
					product_id: 2100,
					product_name: 'Jetpack Backup (Daily)',
					product_slug: 'jetpack_backup_daily',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 4200,
					item_original_cost_display: 'R$42',
					item_subtotal_integer: 4200,
					item_subtotal_display: 'R$42',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
		}

		return {
			product_id: product_id,
			product_name: `Unknown mocked product: ${ product_id }`,
			product_slug: 'unknown',
			currency: currency,
			is_domain_registration: false,
			savings_total_display: '$0',
			savings_total_integer: 0,
			item_subtotal_display: '$0',
			item_subtotal_integer: 0,
			item_tax: 0,
		};
	};
}

export function mockGetCartEndpointWith( initialCart ) {
	return async () => {
		return initialCart;
	};
}

export function getActivePersonalPlanDataForType( type ) {
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

export function getPersonalPlanForInterval( type ) {
	switch ( type ) {
		case 'monthly':
			return planWithoutDomainMonthly;
		case 'yearly':
			return planWithoutDomain;
		case 'two-year':
			return planWithoutDomainBiannual;
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

export function getBusinessPlanForInterval( type ) {
	switch ( type ) {
		case 'monthly':
			return planLevel2Monthly;
		case 'yearly':
			return planLevel2;
		case 'two-year':
			return planLevel2Biannual;
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

export function getVariantItemTextForInterval( type ) {
	switch ( type ) {
		case 'monthly':
			return 'One month';
		case 'yearly':
			return 'One year';
		case 'two-year':
			return 'Two years';
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

export function getPlansItemsState() {
	return [
		{
			product_id: planWithoutDomain.product_id,
			product_slug: planWithoutDomain.product_slug,
			bill_period: 365,
			product_type: 'bundle',
			available: true,
			price: '$48',
			formatted_price: '$48',
			raw_price: 48,
		},
		{
			product_id: planWithoutDomainMonthly.product_id,
			product_slug: planWithoutDomainMonthly.product_slug,
			bill_period: 30,
			product_type: 'bundle',
			available: true,
			price: '$7',
			formatted_price: '$7',
			raw_price: 7,
		},
		{
			product_id: planWithoutDomainBiannual.product_id,
			product_slug: planWithoutDomainBiannual.product_slug,
			bill_period: 730,
			product_type: 'bundle',
			available: true,
			price: '$84',
			formatted_price: '$84',
			raw_price: 84,
		},
		{
			product_id: planLevel2.product_id,
			product_slug: planLevel2.product_slug,
			bill_period: 365,
			product_type: 'bundle',
			available: true,
			price: '$300',
			formatted_price: '$300',
			raw_price: 300,
		},
		{
			product_id: planLevel2Monthly.product_id,
			product_slug: planLevel2Monthly.product_slug,
			bill_period: 30,
			product_type: 'bundle',
			available: true,
			price: '$33',
			formatted_price: '$33',
			raw_price: 33,
		},
		{
			product_id: planLevel2Biannual.product_id,
			product_slug: planLevel2Biannual.product_slug,
			bill_period: 730,
			product_type: 'bundle',
			available: true,
			price: '$499',
			formatted_price: '$499',
			raw_price: 499,
		},
	];
}

export function createTestReduxStore() {
	return applyMiddleware( thunk )( createStore )( () => {
		return {
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
						product_id: planWithoutDomain.product_id,
						product_slug: planWithoutDomain.product_slug,
						product_type: 'bundle',
						available: true,
						is_domain_registration: false,
						cost_display: planWithoutDomain.item_subtotal_display,
						currency_code: planWithoutDomain.currency,
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
		};
	} );
}

export function mockPayPalEndpoint( endpointResponse ) {
	const endpoint = jest.fn();
	endpoint.mockReturnValue( true );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/paypal-express-url', ( body ) => {
			return endpoint( body );
		} )
		.reply( endpointResponse );
	return endpoint;
}

export const mockPayPalRedirectResponse = () => [ 200, 'https://test-redirect-url' ];

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

export const mockTransactionsRedirectResponse = () => [
	200,
	{ redirect_url: 'https://test-redirect-url' },
];

export const mockTransactionsSuccessResponse = () => [ 200, { success: 'true' } ];

function getManagedValueFromString( value ) {
	return { isTouched: true, value, errors: [], isRequired: true };
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
	alternate_email: undefined,
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
