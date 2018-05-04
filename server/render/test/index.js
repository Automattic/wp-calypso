/** @format */

/**
 * Internal dependencies
 */

import { isCacheableQuery } from '..';

describe( 'isCacheableQuery', () => {
	test( 'should return true if the query is empty', () => {
		expect( isCacheableQuery( {} ) ).toBe( true );
	} );

	test( 'should return true if the query is not provided', () => {
		expect( isCacheableQuery() ).toBe( true );
	} );

	test( 'should return false if the query is not empty but no whitelist is provided', () => {
		expect( isCacheableQuery( { not: 'empty' } ) ).toBe( false );
	} );

	test( 'should return false if the query is not empty and the whitelist is empty', () => {
		expect( isCacheableQuery( { not: 'empty' }, [] ) ).toBe( false );
	} );

	test( 'should return false if the query contains not whitelisted keys', () => {
		expect( isCacheableQuery( { key: 'value' }, [ 'different' ] ) ).toBe( false );
	} );

	test( 'should return true if query keys are a subset of whitelist', () => {
		expect( isCacheableQuery( { a: 'a', b: 'b' }, [ 'a', 'b', 'c' ] ) ).toBe( true );
	} );

	test( 'should return true if query keys match whitelist', () => {
		expect( isCacheableQuery( { a: 'a', b: 'b', c: '' }, [ 'a', 'b', 'c' ] ) ).toBe( true );
	} );

	test( 'should return false if any query key is not included', () => {
		expect( isCacheableQuery( { a: 'a', b: 'b' }, [ 'a' ] ) ).toBe( false );
	} );
} );
