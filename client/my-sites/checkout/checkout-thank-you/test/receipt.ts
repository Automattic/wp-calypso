import { createReceiptObject } from '../receipt';
import type { Receipt, ReceiptItem } from '@automattic/api-core';

const item = {
	id: 1,
	type: 'new purchase',
	domain: 'example.com',
	site_id: 999,
	subtotal_integer: 1000,
	amount_integer: 1100,
	new_quantity: 1,
	product: 'Domain Reg',
	product_id: 54321,
	product_type: 'domain',
	product_slug: 'domain-reg',
	variation: 'Domain Registration',
	wpcom_product_slug: 'domain_reg',
	saas_redirect_url: '',
	is_domain_registration: true,
	meta: 'example.com',
	delayed_provisioning: false,
	is_hundred_year_domain: true,
} as ReceiptItem;

const receipt = {
	id: 12345,
	currency: 'USD',
	checkout_type: 'unified',
	items: [ item ],
} as Receipt;

describe( 'createReceiptObject', () => {
	it( 'converts a v1.2 receipt', () => {
		expect( createReceiptObject( receipt ) ).toEqual( {
			receiptId: '12345',
			currency: 'USD',
			checkoutType: 'unified',
			purchases: [
				{
					delayedProvisioning: false,
					isHundredYearDomain: true,
					isDomainRegistration: true,
					meta: 'example.com',
					productId: 54321,
					productSlug: 'domain_reg',
					productType: 'domain',
					productName: 'Domain Registration',
					newQuantity: 1,
					saasRedirectUrl: '',
					blogId: 999,
					priceInteger: 1000,
				},
			],
		} );
	} );

	it( 'falls back to the product name and an empty meta', () => {
		const [ purchase ] = createReceiptObject( {
			...receipt,
			items: [ { ...item, variation: '', meta: null } ],
		} ).purchases;

		expect( purchase.productName ).toBe( 'Domain Reg' );
		expect( purchase.meta ).toBe( '' );
	} );
} );
