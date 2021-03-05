/**
 * Internal dependencies
 */
import reducer, { errorCodeReducer, errorMessageReducer, isComplete } from '../reducer';
import {
	JETPACK_REMOTE_INSTALL,
	JETPACK_REMOTE_INSTALL_FAILURE,
	JETPACK_REMOTE_INSTALL_SUCCESS,
} from 'calypso/state/action-types';

const url = 'https://yourgroovydomain.com';
const errorCodeString = 'INVALID_CREDENTIALS';
const errorMessageString = 'bad password';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		const state = reducer( undefined, {} );

		expect( state ).toHaveProperty( 'isComplete' );
		expect( state ).toHaveProperty( 'errorCode' );
		expect( state ).toHaveProperty( 'errorMessage' );
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

	describe( 'errorCode', () => {
		const errorState = {
			[ url ]: {
				errorCode: errorCodeString,
			},
		};

		test( 'should store error by url', () => {
			const state = errorCodeReducer( undefined, {
				type: JETPACK_REMOTE_INSTALL_FAILURE,
				url,
				errorCode: errorCodeString,
			} );
			expect( state[ url ] ).toEqual( errorCodeString );
		} );

		test( 'should be cleared on successful install', () => {
			const state = errorCodeReducer( errorState, { type: JETPACK_REMOTE_INSTALL_SUCCESS, url } );
			expect( state[ url ] ).not.toBeDefined();
		} );

		test( 'should be cleared on install request', () => {
			const state = errorCodeReducer( errorState, { type: JETPACK_REMOTE_INSTALL, url } );
			expect( state[ url ] ).not.toBeDefined();
		} );
	} );

	describe( 'errorMessage', () => {
		const errorState = {
			[ url ]: {
				errorCode: errorCodeString,
				errorMessage: errorMessageString,
			},
		};

		test( 'should store error message by url', () => {
			const state = errorMessageReducer( undefined, {
				type: JETPACK_REMOTE_INSTALL_FAILURE,
				url,
				errorCode: errorCodeString,
				errorMessage: errorMessageString,
			} );
			expect( state[ url ] ).toEqual( errorMessageString );
		} );

		test( 'should be cleared on successful install', () => {
			const state = errorMessageReducer( errorState, {
				type: JETPACK_REMOTE_INSTALL_SUCCESS,
				url,
			} );
			expect( state[ url ] ).not.toBeDefined();
		} );

		test( 'should be cleared on install request', () => {
			const state = errorMessageReducer( errorState, { type: JETPACK_REMOTE_INSTALL, url } );
			expect( state[ url ] ).not.toBeDefined();
		} );
	} );
} );
