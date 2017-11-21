/** @format */
/**
 * Internal dependencies
 */
import { markCollisions } from '../utils';

describe( 'markCollisions', () => {
	test( 'should mark non-Jetpack sites as conflicting by domain', () => {
		const sites = [ { URL: 'https://example.com', jetpack: true }, { URL: 'https://example.com' } ];

		markCollisions( sites );

		expect( sites[ 0 ] ).not.toHaveProperty( 'hasConflict' );
		expect( sites[ 1 ] ).toHaveProperty( 'hasConflict', true );
	} );

	test( 'should not depend on input ordering', () => {
		const sites = [ { URL: 'https://example.com' }, { URL: 'https://example.com', jetpack: true } ];

		markCollisions( sites );

		expect( sites[ 0 ] ).toHaveProperty( 'hasConflict', true );
		expect( sites[ 1 ] ).not.toHaveProperty( 'hasConflict' );
	} );

	test( 'should not mark collisions from only non-Jetpack sites', () => {
		const sites = [ { URL: 'https://example.com' }, { URL: 'https://example.com' } ];

		markCollisions( sites );

		expect( sites[ 0 ] ).not.toHaveProperty( 'hasConflict' );
		expect( sites[ 1 ] ).not.toHaveProperty( 'hasConflict' );
	} );

	test( 'should not mark collisions from only Jetpack sites', () => {
		const sites = [
			{ URL: 'https://example.com', jetpack: true },
			{ URL: 'https://example.com', jetpack: true },
		];

		markCollisions( sites );

		expect( sites[ 0 ] ).not.toHaveProperty( 'hasConflict' );
		expect( sites[ 1 ] ).not.toHaveProperty( 'hasConflict' );
	} );

	test( 'should ignore http/https differences', () => {
		const sites = [ { URL: 'https://example.com', jetpack: true }, { URL: 'http://example.com' } ];

		markCollisions( sites );

		expect( sites[ 0 ] ).not.toHaveProperty( 'hasConflict' );
		expect( sites[ 1 ] ).toHaveProperty( 'hasConflict', true );
	} );

	test( 'should not let cache break new calculations', () => {
		const before = [
			{ URL: 'https://example.com', jetpack: true },
			{ URL: 'https://example.com' },
		];

		markCollisions( before );

		expect( before[ 0 ] ).not.toHaveProperty( 'hasConflict' );
		expect( before[ 1 ] ).toHaveProperty( 'hasConflict', true );

		const after = [ { URL: 'https://example.net', jetpack: true }, { URL: 'https://example.com' } ];

		markCollisions( after );

		expect( after[ 0 ] ).not.toHaveProperty( 'hasConflict' );
		expect( after[ 1 ] ).not.toHaveProperty( 'hasConflict' );
	} );
} );
