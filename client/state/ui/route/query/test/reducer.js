/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';
import path from '../reducer';

describe( 'reducer', () => {
	it( 'should set the current and the initial query to the value of the query attribute of the ROUTE_SET action', () => {
		const state = path( undefined, {
			type: ROUTE_SET,
			query: { retry: 1, lang: 'fr' },
		} );

		expect( state.initial.retry ).to.equal( 1 );
		expect( state.initial.lang ).to.equal( 'fr' );
		expect( state.current.retry ).to.equal( 1 );
		expect( state.current.lang ).to.equal( 'fr' );
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

		expect( state.initial.retry ).to.equal( 1 );
		expect( state.initial.lang ).to.equal( 'fr' );
		expect( state.current.retry ).to.equal( 2 );
		expect( state.current.lang ).to.equal( undefined );
	} );
} );
