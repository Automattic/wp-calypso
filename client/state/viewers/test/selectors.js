/**
 * Internal dependencies
 */
import { isFetchingViewers, getTotalViewers, getViewers } from '../selectors';

describe( '#getViewers', () => {
	test( 'should return list of viewers for given site', () => {
		const state = {
			viewers: {
				items: {
					1: { ID: 1, name: 'arbitrary viewer name 1' },
					2: { ID: 2, name: 'arbitrary viewer name 2' },
				},
				queries: {
					[ 12345 ]: { ids: [ 1, 2 ] },
					[ 54321 ]: { ids: [ 1 ] },
				},
			},
		};

		const expectedOutput = [
			{ ID: 1, name: 'arbitrary viewer name 1' },
			{ ID: 2, name: 'arbitrary viewer name 2' },
		];

		expect( getViewers( state, 12345 ) ).toEqual( expectedOutput );
		expect( getViewers( state, 54321 ) ).toEqual( expectedOutput.slice( 0, 1 ) );
	} );

	test( 'should return an empty array if no data is available', () => {
		const state = {
			viewers: {
				items: {
					1: { ID: 1, name: 'arbitrary viewer name 1' },
				},
				queries: {
					[ 54321 ]: { ids: [ 1 ] },
				},
			},
		};

		expect( getViewers( state, 12345 ) ).toEqual( [] );
	} );

	test( 'should return the same empty array on subsequent calls if no data is available', () => {
		const state = { viewers: { items: {}, queries: {} } };

		const result = getViewers( state, 12345 );
		expect( getViewers( state, 12345 ) ).toBe( result );
	} );
} );

describe( '#getTotalViewers', () => {
	test( 'should return number of total viewers', () => {
		const state = {
			viewers: {
				queries: {
					[ 12345 ]: { found: 3 },
					[ 54321 ]: { found: 0 },
				},
			},
		};

		expect( getTotalViewers( state, 12345 ) ).toBe( 3 );
		expect( getTotalViewers( state, 54321 ) ).toBe( 0 );
	} );

	test( 'should return `0` if no data is available', () => {
		const state = { viewers: { queries: {} } };

		expect( getTotalViewers( state, 12345 ) ).toBe( 0 );
	} );
} );

describe( '#isFetchingViewers', () => {
	test( 'should return `true` if currently fetching', () => {
		const state = { viewers: { fetching: { [ 12345 ]: true } } };

		expect( isFetchingViewers( state, 12345 ) ).toBe( true );
	} );

	test( 'should return `false` if not currently fetching', () => {
		const state1 = { viewers: { fetching: { [ 12345 ]: false } } };
		const state2 = { viewers: { fetching: {} } };

		expect( isFetchingViewers( state1, 12345 ) ).toBe( false );
		expect( isFetchingViewers( state2, 12345 ) ).toBe( false );
	} );
} );
