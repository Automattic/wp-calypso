/** @format */
/**
 * Internal dependencies
 */
import reducer, { error, isComplete } from '../reducer';
import {
	jetpackRemoteInstall,
	jetpackRemoteInstallComplete,
	jetpackRemoteInstallUpdateError,
} from '../actions';

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
			const state = isComplete( undefined, jetpackRemoteInstallComplete( url ) );
			expect( state[ url ] ).toBe( true );
		} );

		test( 'should be cleared on install request', () => {
			const initialState = {
				[ url ]: {
					isComplete: true,
				},
			};
			const state = isComplete( initialState, jetpackRemoteInstall( url ) );
			expect( state[ url ] ).toBeFalsy();
		} );
	} );

	describe( 'error', () => {
		const errorState = {
			[ url ]: {
				error: errorCode,
			},
		};

		test( 'should store error by url', () => {
			const state = error( undefined, jetpackRemoteInstallUpdateError( url, errorCode ) );
			expect( state[ url ] ).toEqual( errorCode );
		} );

		test( 'should be cleared on successful install', () => {
			const state = error( errorState, jetpackRemoteInstallComplete( url ) );
			expect( state[ url ] ).toBeFalsy();
		} );

		test( 'should be cleared on install request', () => {
			const state = error( errorState, jetpackRemoteInstall( url ) );
			expect( state[ url ] ).toBeFalsy();
		} );
	} );
} );
