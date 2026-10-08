import { getNeighbours } from '../use-resource-selection';
import type { AgencyEnablementResource } from '@automattic/api-core';

// Only the ids matter here.
const results = [ 1, 2, 3 ].map( ( id ) => ( { id } ) as AgencyEnablementResource );

describe( 'getNeighbours', () => {
	test( 'finds the previous and next results around the selected one', () => {
		expect( getNeighbours( results, 2 ) ).toEqual( {
			selected: results[ 1 ],
			previous: results[ 0 ],
			next: results[ 2 ],
		} );
	} );

	test( 'has no previous result for the first, nor next for the last', () => {
		expect( getNeighbours( results, 1 ).previous ).toBeUndefined();
		expect( getNeighbours( results, 3 ).next ).toBeUndefined();
	} );

	test( 'selects nothing when no result matches', () => {
		expect( getNeighbours( results, null ) ).toEqual( {} );
		expect( getNeighbours( results, 99 ) ).toEqual( {} );
	} );
} );
