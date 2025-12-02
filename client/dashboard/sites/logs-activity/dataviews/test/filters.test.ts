import {
	getInitialFiltersFromSearch,
	getInitialSearchTermFromSearch,
	extractActivityLogTypeValues,
	getValuesSignature,
} from '../filters';
import type { Filter } from '@wordpress/dataviews';

describe( 'logs-activity/dataviews/filters', () => {
	describe( 'getInitialFiltersFromSearch', () => {
		it( 'returns [] for empty or missing params', () => {
			expect( getInitialFiltersFromSearch( '' ) ).toEqual( [] );
			expect( getInitialFiltersFromSearch( '?foo=bar' ) ).toEqual( [] );
		} );

		it( 'parses activity_type with multiple, deduped values (order-insensitive check)', () => {
			const out = getInitialFiltersFromSearch( '?activity_type=a,b,a%20c' );
			expect( out ).toHaveLength( 1 );
			expect( out[ 0 ] ).toMatchObject( { field: 'activity_type', operator: 'isAny' } );
			const values = ( out[ 0 ] as Filter ).value as string[];
			expect( values.sort() ).toEqual( [ 'a', 'a c', 'b' ].sort() );
		} );
	} );

	describe( 'getInitialSearchTermFromSearch', () => {
		it( 'decodes + and percent-encoding and trims whitespace', () => {
			expect( getInitialSearchTermFromSearch( '?search=John+Doe' ) ).toBe( 'John Doe' );
			expect( getInitialSearchTermFromSearch( '?search=a%2Bb' ) ).toBe( 'a b' );
			expect( getInitialSearchTermFromSearch( '?search=%20' ) ).toBeUndefined();
		} );
	} );

	describe( 'extractActivityLogTypeValues', () => {
		it( 'extracts array values, filtering empties and non-strings', () => {
			const filters = [
				{ field: 'activity_type', operator: 'isAny', value: [ 'one', '', 'two' ] },
			] as unknown as Filter[];
			expect( extractActivityLogTypeValues( filters ).sort() ).toEqual( [ 'one', 'two' ] );
		} );

		it( 'extracts single string value', () => {
			const filters = [
				{ field: 'activity_type', operator: 'isAny', value: 'single' },
			] as unknown as Filter[];
			expect( extractActivityLogTypeValues( filters ) ).toEqual( [ 'single' ] );
		} );

		it( 'returns [] when no matching filter', () => {
			expect( extractActivityLogTypeValues( [] ) ).toEqual( [] );
		} );
	} );

	describe( 'getValuesSignature', () => {
		it( 'produces a stable, sorted signature', () => {
			expect( getValuesSignature( [ 'b', 'a', 'b' ] ) ).toBe( 'a,b,b' );
			expect( getValuesSignature( [] ) ).toBe( '' );
		} );
	} );
} );
