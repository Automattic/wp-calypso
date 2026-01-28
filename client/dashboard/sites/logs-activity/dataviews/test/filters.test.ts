import { extractActivityLogTypeValues } from '../filters';
import type { Filter } from '@wordpress/dataviews';

describe( 'logs-activity/dataviews/filters', () => {
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
} );
