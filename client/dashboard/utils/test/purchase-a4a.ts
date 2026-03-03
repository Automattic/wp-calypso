import { isA4ABillingDragonPurchase, isA4ATemporarySitePurchase } from '../purchase';
import type { Purchase } from '@automattic/api-core';

describe( 'isA4ABillingDragonPurchase', () => {
	test( 'should return true when purchase meta is "is-a4a"', () => {
		const purchase = { meta: 'is-a4a' } as Purchase;
		expect( isA4ABillingDragonPurchase( purchase ) ).toBe( true );
	} );

	test( 'should return false when purchase meta is a domain name', () => {
		const purchase = { meta: 'example.com' } as Purchase;
		expect( isA4ABillingDragonPurchase( purchase ) ).toBe( false );
	} );

	test( 'should return false when purchase meta is empty', () => {
		const purchase = { meta: '' } as Purchase;
		expect( isA4ABillingDragonPurchase( purchase ) ).toBe( false );
	} );

	test( 'should return false when purchase meta is undefined', () => {
		const purchase = { meta: undefined } as Purchase;
		expect( isA4ABillingDragonPurchase( purchase ) ).toBe( false );
	} );
} );

describe( 'isA4ATemporarySitePurchase', () => {
	test( 'should return true for a siteless A4A billing dragon purchase', () => {
		const purchase = {
			domain: 'siteless.a4a.com',
			meta: 'is-a4a',
		} as Purchase;
		expect( isA4ATemporarySitePurchase( purchase ) ).toBe( true );
	} );

	test( 'should return false for an A4A purchase on a real site', () => {
		const purchase = {
			domain: 'example.com',
			meta: 'is-a4a',
		} as Purchase;
		expect( isA4ATemporarySitePurchase( purchase ) ).toBe( false );
	} );

	test( 'should return false for a non-A4A temporary site purchase', () => {
		const purchase = {
			domain: 'siteless.jetpack.com',
			meta: '',
		} as Purchase;
		expect( isA4ATemporarySitePurchase( purchase ) ).toBe( false );
	} );
} );
