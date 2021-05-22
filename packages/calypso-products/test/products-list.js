/**
 * Internal dependencies
 */
import { objectIsProduct } from '../src';

describe( 'objectIsProduct', () => {
	it( 'returns false if the product is null', () => {
		expect( objectIsProduct( null ) ).toBeFalsy();
	} );

	it( 'returns false if the product is not an object', () => {
		expect( objectIsProduct( [ 'product_slug' ] ) ).toBeFalsy();
	} );

	it( 'returns true if the product has all required keys', () => {
		const data = {
			product_slug: 'a',
			product_name: 'b',
			term: 'c',
			bill_period: 'd',
		};
		expect( objectIsProduct( data ) ).toBeTruthy();
	} );

	it( 'returns false if the product has a missing product_slug', () => {
		const data = {
			product_name: 'b',
			term: 'c',
			bill_period: 'd',
		};
		expect( objectIsProduct( data ) ).toBeFalsy();
	} );

	it( 'returns false if the product has a missing product_name', () => {
		const data = {
			product_slug: 'a',
			term: 'c',
			bill_period: 'd',
		};
		expect( objectIsProduct( data ) ).toBeFalsy();
	} );

	it( 'returns false if the product has a missing term', () => {
		const data = {
			product_slug: 'a',
			product_name: 'b',
			bill_period: 'd',
		};
		expect( objectIsProduct( data ) ).toBeFalsy();
	} );

	it( 'returns false if the product has a missing bill_period', () => {
		const data = {
			product_slug: 'a',
			product_name: 'b',
			term: 'c',
		};
		expect( objectIsProduct( data ) ).toBeFalsy();
	} );
} );
