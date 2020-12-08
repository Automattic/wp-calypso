/**
 * Internal dependencies
 */
import { createTransientMediaId } from '../create-transient-media-id';

describe( 'createTransientMediaId()', () => {
	test( `should return a string prefixed with 'media-'`, () => {
		const result = createTransientMediaId();

		expect( typeof result ).toBe( 'string' );
		expect( result.startsWith( 'media-' ) ).toBe( true );
	} );

	test( `should return a string prefixed with 'media-' and given enhanced prefix string`, () => {
		const result = createTransientMediaId( 'arbitrary-enhanced-prefix' );

		expect( typeof result ).toBe( 'string' );
		expect( result.startsWith( 'media-arbitrary-enhanced-prefix' ) ).toBe( true );
	} );
} );
