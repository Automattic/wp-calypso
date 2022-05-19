import { ROUTE_SET } from 'calypso/state/action-types';
import path from '../reducer';

describe( 'reducer', () => {
	it( 'should set the current and the initial query to the value of the query attribute of the ROUTE_SET action', () => {
		const state = path( undefined, {
			type: ROUTE_SET,
			query: { retry: 1, lang: 'fr' },
		} );

		expect( state.initial.retry ).toEqual( 1 );
		expect( state.initial.lang ).toEqual( 'fr' );
		expect( state.current.retry ).toEqual( 1 );
		expect( state.current.lang ).toEqual( 'fr' );
		expect( state.previous ).toEqual( false );
	} );

	it( 'should only update current query the second time a ROUTE_SET action is triggered', () => {
		const initialState = path( undefined, {
			type: ROUTE_SET,
			query: { retry: 1, lang: 'fr' },
		} );

		const state = path( initialState, {
			type: ROUTE_SET,
			query: { retry: 2 },
		} );

		expect( state.initial.retry ).toEqual( 1 );
		expect( state.initial.lang ).toEqual( 'fr' );
		expect( state.current.retry ).toEqual( 2 );
		expect( state.current.lang ).toBeUndefined();
		expect( state.previous.retry ).toEqual( 1 );
		expect( state.previous.lang ).toEqual( 'fr' );
	} );
} );
