/**
 * @jest-environment jsdom
 */
import ensureCurrentFirst from '../ensure-current-first';
import type { StyleVariation } from '../../components/styles-preview';

const makeVariation = ( title: string, palette?: string[] ): StyleVariation =>
	( {
		title,
		settings: palette ? { color: { palette: { theme: palette } } } : {},
		styles: {},
	} ) as StyleVariation;

describe( 'ensureCurrentFirst', () => {
	const variations = [
		makeVariation( 'Bold', [ 'red', 'blue' ] ),
		makeVariation( 'Pastel', [ 'pink', 'lavender' ] ),
		makeVariation( 'Dark', [ 'black', 'gray' ] ),
	];

	const getValue = ( v: StyleVariation ) => v.settings?.color?.palette?.theme;

	it( 'moves the matching variation to index 0', () => {
		const result = ensureCurrentFirst( variations, [ 'black', 'gray' ], getValue );
		expect( result[ 0 ].title ).toBe( 'Dark' );
		expect( result ).toHaveLength( 3 );
	} );

	it( 'keeps order when already at index 0', () => {
		const result = ensureCurrentFirst( variations, [ 'red', 'blue' ], getValue );
		expect( result[ 0 ].title ).toBe( 'Bold' );
		expect( result ).toHaveLength( 3 );
	} );

	it( 'prepends a synthetic variation when no match and factory provided', () => {
		const result = ensureCurrentFirst( variations, [ 'green', 'teal' ], getValue, () =>
			makeVariation( 'Current', [ 'green', 'teal' ] )
		);
		expect( result[ 0 ].title ).toBe( 'Current' );
		expect( result ).toHaveLength( 4 );
	} );

	it( 'does not prepend when factory returns null', () => {
		const result = ensureCurrentFirst( variations, [ 'green', 'teal' ], getValue, () => null );
		expect( result ).toHaveLength( 3 );
		expect( result[ 0 ].title ).toBe( 'Bold' );
	} );

	it( 'returns unchanged when no match and no factory', () => {
		const result = ensureCurrentFirst( variations, [ 'green', 'teal' ], getValue );
		expect( result ).toHaveLength( 3 );
		expect( result[ 0 ].title ).toBe( 'Bold' );
	} );

	it( 'deduplicates by title', () => {
		const duped = [ ...variations, makeVariation( 'Bold', [ 'red', 'blue' ] ) ];
		const result = ensureCurrentFirst( duped, [ 'pink', 'lavender' ], getValue );
		expect( result ).toHaveLength( 3 );
		expect( result[ 0 ].title ).toBe( 'Pastel' );
	} );

	it( 'returns unchanged for empty variations', () => {
		const result = ensureCurrentFirst( [], [ 'red' ], getValue );
		expect( result ).toHaveLength( 0 );
	} );

	it( 'deduplicates even when liveValue is null', () => {
		const result = ensureCurrentFirst( variations, null, getValue );
		expect( result ).toHaveLength( 3 );
		expect( result[ 0 ].title ).toBe( 'Bold' );
	} );
} );
