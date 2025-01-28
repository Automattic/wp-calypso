import { createReceiptObject } from '../assembler';
import type { RawReceiptData, ReceiptData } from '../types';
import type { WPCOMTransactionEndpointResponse } from '@automattic/wpcom-checkout';

const siteId = 42561;

const rawReceiptEndpointReceipt: RawReceiptData = {
	receipt_id: '12345',
	display_price: '$100',
	price_float: 100,
	price_integer: 10000,
	currency: 'USD',
	is_gravatar_domain: false,
	purchases: [
		{
			user_email: '',
			is_domain_registration: true,
			meta: 'example.com',
			product_id: '54321',
			product_slug: 'domain-reg',
			product_type: 'domain',
			product_name: 'Domain Reg',
			product_name_short: 'Domain',
			new_quantity: 1,
			registrar_support_url: 'something.com',
			is_email_verified: true,
			is_root_domain_with_us: false,
			is_renewal: false,
			will_auto_renew: true,
			blog_id: 999,
			price_integer: 10,
		},
	],
};

const rawTransactionReceipt: WPCOMTransactionEndpointResponse = {
	success: true,
	order_id: 3,
	is_gift_purchase: false,
	receipt_id: 12345,
	display_price: '$100',
	price_float: 100,
	price_integer: 10000,
	currency: 'USD',
	purchases: {
		[ siteId ]: [
			{
				user_email: '',
				is_domain_registration: true,
				meta: 'example.com',
				product_id: '54321',
				product_slug: 'domain-reg',
				product_type: 'domain',
				product_name: 'Domain Reg',
				product_name_short: 'Domain',
				new_quantity: 1,
				registrar_support_url: 'something.com',
				is_email_verified: true,
				is_root_domain_with_us: false,
				is_renewal: false,
				will_auto_renew: true,
				blog_id: 999,
				price_integer: 10,
			},
		],
	},
	failed_purchases: [],
};

const standardAssembledReceipt: ReceiptData = {
	currency: 'USD',
	displayPrice: '$100',
	failedPurchases: [],
	priceFloat: 100,
	priceInteger: 10000,
	isGravatarDomain: false,
	purchases: [
		{
			delayedProvisioning: false,
			freeTrial: false,
			isDomainRegistration: true,
			isEmailVerified: true,
			isRenewal: false,
			isRootDomainWithUs: false,
			isHundredYearDomain: false,
			meta: 'example.com',
			newQuantity: 1,
			productId: '54321',
			productName: 'Domain Reg',
			productNameShort: 'Domain',
			productSlug: 'domain-reg',
			productType: 'domain',
			registrarSupportUrl: 'something.com',
			willAutoRenew: true,
			saasRedirectUrl: '',
			blogId: 999,
			priceInteger: 10,
		},
	],
	receiptId: '12345',
};

describe( 'createReceiptObject', () => {
	it( 'returns an expected object for standard transaction receipt data', () => {
		const actual = createReceiptObject( rawTransactionReceipt );
		expect( actual ).toEqual( standardAssembledReceipt );
	} );

	it( 'returns an expected object for standard receipt endpoint data', () => {
		const actual = createReceiptObject( rawReceiptEndpointReceipt );
		expect( actual ).toEqual( standardAssembledReceipt );
	} );

	it( 'returns an expected object for receipt data with no purchases', () => {
		const actual = createReceiptObject( {
			...rawTransactionReceipt,
			purchases: [],
		} );
		expect( actual ).toEqual( {
			...standardAssembledReceipt,
			purchases: [],
		} );
	} );

	it( 'returns an expected object for receipt data with undefined purchases', () => {
		const actual = createReceiptObject( {
			...rawTransactionReceipt,
			purchases: undefined,
		} );
		expect( actual ).toEqual( {
			...standardAssembledReceipt,
			purchases: [],
		} );
	} );

	it( 'returns an expected object for receipt data with false purchases', () => {
		const actual = createReceiptObject( {
			...rawReceiptEndpointReceipt,
			purchases: false,
		} );
		expect( actual ).toEqual( {
			...standardAssembledReceipt,
			purchases: [],
		} );
	} );

	it( 'returns an expected object for standard receipt data when saas redirect key is supplied', () => {
		const url = 'http://example.com';

		const clonedStandardRawReceipt = { ...rawTransactionReceipt };
		clonedStandardRawReceipt.purchases[ siteId ][ 0 ].saas_redirect_url = url;

		const actual = createReceiptObject( clonedStandardRawReceipt );

		const clonedStandardAssembledReceipt = { ...standardAssembledReceipt };
		clonedStandardAssembledReceipt.purchases[ 0 ].saasRedirectUrl = url;

		expect( actual ).toEqual( clonedStandardAssembledReceipt );
	} );
} );
