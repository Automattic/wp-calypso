/** @format */
/**
 * Internal dependencies
 */
import reducer, { error, isComplete } from '../reducer';
import {
	JETPACK_REMOTE_INSTALL,
	JETPACK_REMOTE_INSTALL_FAILURE,
	JETPACK_REMOTE_INSTALL_SUCCESS,
} from 'state/action-types';

const url = 'https://yourgroovydomain.com';
const errorCode = 'INVALID_CREDENTIALS';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		const state = reducer( undefined, {} );

		expect( state ).toHaveProperty( 'isComplete' );
		expect( state ).toHaveProperty( 'error' );
	} );

	describe( 'isComplete', () => {
		test( 'should store install complete by url', () => {
			const state = isComplete( undefined, { type: JETPACK_REMOTE_INSTALL_SUCCESS, url } );
			expect( state[ url ] ).toBe( true );
		} );

		test( 'should be cleared on install request', () => {
			const initialState = {
				[ url ]: {
					isComplete: true,
				},
			};
			const state = isComplete( initialState, { type: JETPACK_REMOTE_INSTALL, url } );
			expect( state[ url ] ).not.toBeDefined();
		} );
	} );

	describe( 'error', () => {
		const errorState = {
			[ url ]: {
				error: errorCode,
			},
		};

		test( 'should store error by url', () => {
			const state = error( undefined, { type: JETPACK_REMOTE_INSTALL_FAILURE, url, errorCode } );
			expect( state[ url ] ).toEqual( errorCode );
		} );

		test( 'should be cleared on successful install', () => {
			const state = error( errorState, { type: JETPACK_REMOTE_INSTALL_SUCCESS, url } );
			expect( state[ url ] ).not.toBeDefined();
		} );

		test( 'should be cleared on install request', () => {
			const state = error( errorState, { type: JETPACK_REMOTE_INSTALL, url } );
			expect( state[ url ] ).not.toBeDefined();
		} );
	} );
} );
