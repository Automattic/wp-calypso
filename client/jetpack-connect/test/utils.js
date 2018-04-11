/** @format */

/**
 * Internal dependencies
 */
import { addCalypsoEnvQueryArg, cleanUrl, getRoleFromScope } from '../utils';

jest.mock( 'config', () => input => {
	const lookupTable = {
		env_id: 'mocked-test-env-id',
	};
	if ( input in lookupTable ) {
		return lookupTable[ input ];
	}
	throw new Error( 'Unrecognized input to mocked config' );
} );

describe( 'addCalypsoEnvQueryArg', () => {
	test( 'should add config env_id as calypso_env', () => {
		expect( addCalypsoEnvQueryArg( 'http://example.com' ) ).toBe(
			'http://example.com/?calypso_env=mocked-test-env-id'
		);
	} );
} );

describe( 'cleanUrl', () => {
	test( 'should prepare entered urls for network access', () => {
		const results = [
			{ input: '', expected: '' },
			{ input: 'a', expected: 'http://a' },
			{ input: 'example.com', expected: 'http://example.com' },
			{ input: '  example.com   ', expected: 'http://example.com' },
			{ input: 'http://example.com/', expected: 'http://example.com' },
			{ input: 'eXAmple.com', expected: 'http://example.com' },
			{ input: 'example.com/wp-admin', expected: 'http://example.com' },
		];

		results.forEach( ( { input, expected } ) => expect( cleanUrl( input ) ).toBe( expected ) );
	} );
} );

describe( 'getRoleFromScope', () => {
	test( 'should return role from scope', () => {
		const result = getRoleFromScope( 'role:e8ae7346d1a0f800b64e' );
		expect( result ).toBe( 'role' );
	} );

	test( 'should return null if no role is found', () => {
		const result = getRoleFromScope( ':e8ae7346d1a0f800b64e' );
		expect( result ).toBe( null );
	} );

	test( 'should return null if no hash is found', () => {
		const result = getRoleFromScope( 'role' );
		expect( result ).toBe( null );
	} );

	test( 'should return null if scope is malformed', () => {
		const result = getRoleFromScope( 'rolee8ae7346d1a0f800b64e' );
		expect( result ).toBe( null );
	} );
} );
