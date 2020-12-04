/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'calypso/state/action-types';
import path from '../reducer';

describe( 'reducer', () => {
	it( 'should set the current and the initial route to the value of the path attribute of the ROUTE_SET action', () => {
		const state = path( undefined, {
			type: ROUTE_SET,
			path: '/themes',
		} );

		expect( state.initial ).to.equal( '/themes' );
		expect( state.current ).to.equal( '/themes' );
		expect( state.previous ).to.equal( '' );
	} );

	it( 'should set the previous and the current route to the value of the path attribute of the previous ROUTE_SET action', () => {
		const state = path( undefined, {
			type: ROUTE_SET,
			path: '/themes',
		} );

		const nextState = path( state, {
			type: ROUTE_SET,
			path: '/plugins',
		} );
		expect( nextState.previous ).to.equal( '/themes' );
		expect( nextState.current ).to.equal( '/plugins' );
	} );
} );
