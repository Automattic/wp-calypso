/**
 * @jest-environment node
 */

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: jest.fn( ( format: string ) => format ),
} ) );

import { isA4ABillingDragonPurchase, isA4ATemporarySitePurchase } from '../purchase';
import type { Purchase } from '@automattic/api-core';

describe( 'isA4ABillingDragonPurchase', () => {
	test( 'returns true when purchase.meta is "is-a4a"', () => {
		const purchase = { meta: 'is-a4a' } as Purchase;
		expect( isA4ABillingDragonPurchase( purchase ) ).toBe( true );
	} );

	test( 'returns false when purchase.meta is empty', () => {
		const purchase = { meta: '' } as Purchase;
		expect( isA4ABillingDragonPurchase( purchase ) ).toBe( false );
	} );

	test( 'returns false when purchase.meta is a different value', () => {
		const purchase = { meta: 'some-other-value' } as Purchase;
		expect( isA4ABillingDragonPurchase( purchase ) ).toBe( false );
	} );
} );

describe( 'isA4ATemporarySitePurchase', () => {
	test( 'returns true for a siteless A4A purchase', () => {
		const purchase = {
			domain: 'siteless.agencies.automattic.com',
			meta: 'is-a4a',
		} as Purchase;
		expect( isA4ATemporarySitePurchase( purchase ) ).toBe( true );
	} );

	test( 'returns false for a real-site A4A purchase', () => {
		const purchase = {
			domain: 'example.com',
			meta: 'is-a4a',
		} as Purchase;
		expect( isA4ATemporarySitePurchase( purchase ) ).toBe( false );
	} );

	test( 'returns false for a non-A4A siteless purchase', () => {
		const purchase = {
			domain: 'siteless.jetpack.com',
			meta: '',
		} as Purchase;
		expect( isA4ATemporarySitePurchase( purchase ) ).toBe( false );
	} );
} );
