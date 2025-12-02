import { filtersSignature } from '../filters';
import type { Filter } from '@wordpress/dataviews';

describe( 'logs/dataviews/filters', () => {
	it( 'filtersSignature generates canonical, field-ordered, value-sorted signature', () => {
		const filters = [
			{ field: 'c', operator: 'isAny', value: [ 'x' ] },
			{ field: 'a', operator: 'isAny', value: [ 'b', 'a' ] },
		] as unknown as Filter[];
		const sig = filtersSignature( filters, [ 'c', 'a' ] );
		expect( sig ).toBe( 'a:a,b|c:x' );
	} );

	it( 'handles undefined filters and empty values', () => {
		expect( filtersSignature( undefined, [ 'a' ] ) ).toBe( 'a:' );
		const filters = [ { field: 'a', operator: 'isAny', value: [] } ] as unknown as Filter[];
		expect( filtersSignature( filters, [ 'a' ] ) ).toBe( 'a:' );
	} );
} );
