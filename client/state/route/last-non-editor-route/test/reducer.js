/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'calypso/state/action-types';
import path from '../reducer';

describe( 'reducer', () => {
	it( 'should set the initial value to empty', () => {
		const state = path( undefined, {
			type: 'INIT',
		} );

		expect( state ).toBe( '' );
	} );

	it( 'should set the value if the ROUTE_SET action is for a non-editor path', () => {
		const state = path( undefined, {
			type: 'INIT',
		} );

		const nextState = path( state, {
			type: ROUTE_SET,
			path: '/plugins',
		} );
		expect( nextState ).toBe( '/plugins' );
	} );

	it( 'should not set the value if the ROUTE_SET action is for an editor path', () => {
		const state = path( undefined, {
			type: ROUTE_SET,
			path: '/plugins',
		} );

		const nextState = path( state, {
			type: ROUTE_SET,
			path: '/block-editor/page/my-test-site.wordpress.com/2',
		} );
		expect( nextState ).toBe( '/plugins' );
	} );
} );
