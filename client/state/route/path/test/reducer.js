import { ROUTE_SET } from 'calypso/state/action-types';
import path from '../reducer';

describe( 'reducer', () => {
	it( 'should set the current and the initial route to the value of the path attribute of the ROUTE_SET action', () => {
		const state = path( undefined, {
			type: ROUTE_SET,
			path: '/themes',
		} );

		expect( state.initial ).toEqual( '/themes' );
		expect( state.current ).toEqual( '/themes' );
		expect( state.previous ).toEqual( '' );
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
		expect( nextState.previous ).toEqual( '/themes' );
		expect( nextState.current ).toEqual( '/plugins' );
	} );
} );
