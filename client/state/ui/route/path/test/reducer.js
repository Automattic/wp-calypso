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
	it( 'should set the current and the initial route to the value of the path attribute of the ROUTE_SET action', () => {
		const state = path( undefined, {
			type: ROUTE_SET,
			path: '/themes',
		} );

		expect( state.initial ).to.equal( '/themes' );
		expect( state.current ).to.deep.equal( '/themes' );
	} );
} );
