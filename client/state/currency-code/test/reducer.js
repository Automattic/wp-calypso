import {
	SITE_PLANS_FETCH_COMPLETED,
	SITE_PRODUCTS_FETCH_COMPLETED,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import currencyCode from '../reducer';

describe( '#currencyCode()', () => {
	test( 'should default to null', () => {
		const state = currencyCode( undefined, {} );
		expect( state ).toBeNull();
	} );
	test( 'should return current state when we have empty site plans', () => {
		const state = currencyCode( 'USD', {
			type: SITE_PLANS_FETCH_COMPLETED,
			plans: [],
		} );
		expect( state ).toBe( 'USD' );
	} );
	test( 'should set currency code when site plans are received', () => {
		const state = currencyCode( undefined, {
			type: SITE_PLANS_FETCH_COMPLETED,
			plans: [
				{
					productName: 'Free',
					currencyCode: 'USD',
				},
			],
		} );
		expect( state ).toBe( 'USD' );
	} );
	test( 'should update currency code when site plans are received', () => {
		const state = currencyCode( 'USD', {
			type: SITE_PLANS_FETCH_COMPLETED,
			plans: [
				{
					productName: 'Free',
					currencyCode: 'CAD',
				},
			],
		} );
		expect( state ).toBe( 'CAD' );
	} );
	test( 'should set currency code when site products fetch is completed', () => {
		const state = currencyCode( undefined, {
			type: SITE_PRODUCTS_FETCH_COMPLETED,
			products: {
				free_plan: {
					product_name: 'WordPress.com Free',
					currency_code: 'USD',
				},
			},
		} );
		expect( state ).toBe( 'USD' );
	} );
	test( 'should update currency code when site products fetch is completed', () => {
		const state = currencyCode( 'USD', {
			type: SITE_PRODUCTS_FETCH_COMPLETED,
			products: {
				free_plan: {
					product_name: 'WordPress.com Free',
					currency_code: 'CAD',
				},
			},
		} );
		expect( state ).toBe( 'CAD' );
	} );
	test( 'should persist state', () => {
		const original = 'JPY';
		const state = serialize( currencyCode, original );
		expect( state ).toBe( original );
	} );
	test( 'should restore valid persisted state', () => {
		const original = 'JPY';
		const state = deserialize( currencyCode, original );
		expect( state ).toBe( original );
	} );
	test( 'should ignore invalid persisted state', () => {
		const original = 1234;
		const state = deserialize( currencyCode, original );
		expect( state ).toBeNull();
	} );
} );
