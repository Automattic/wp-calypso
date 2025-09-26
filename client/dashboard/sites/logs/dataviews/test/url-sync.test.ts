import { syncFiltersSearchParams, decodeSearchParam } from '../url-sync';
import type { Filter } from '@wordpress/dataviews';

describe( 'logs/dataviews/url-sync', () => {
	describe( 'decodeSearchParam', () => {
		it( 'decodes plus-as-space and percent-encoding', () => {
			expect( decodeSearchParam( 'John+Doe' ) ).toBe( 'John Doe' );
			expect( decodeSearchParam( 'a%2Bb' ) ).toBe( 'a+b' );
		} );
	} );

	describe( 'syncFiltersSearchParams', () => {
		it( 'sets deduped, trimmed, sorted values for allowed fields', () => {
			const params = new URLSearchParams( 'foo=bar&activity_type=old' );
			const allowed = [ 'activity_type', 'other' ] as const;
			const filters = [
				{ field: 'activity_type', operator: 'isAny', value: [ ' b ', 'a', 'a' ] },
				{ field: 'other', operator: 'isAny', value: [] },
			] as unknown as Filter[];
			syncFiltersSearchParams( params, allowed, filters );
			expect( params.get( 'activity_type' ) ).toBe( 'a,b' );
			// "other" should be deleted because it is empty
			expect( params.has( 'other' ) ).toBe( false );
			// unrelated params remain
			expect( params.get( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'deletes param when values are empty', () => {
			const params = new URLSearchParams( 'activity_type=a' );
			syncFiltersSearchParams( params, [ 'activity_type' ], [] );
			expect( params.has( 'activity_type' ) ).toBe( false );
		} );
	} );
} );
