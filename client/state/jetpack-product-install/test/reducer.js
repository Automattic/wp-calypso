/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { receiveJetpackProductInstallStatus } from '../actions';

describe( 'reducer', () => {
	test( 'should default to an empty object', () => {
		const state = reducer( undefined, {} );

		expect( state ).toEqual( {} );
	} );

	test( 'should save installation status for the current site', () => {
		const siteId = 12345678;
		const status = {
			akismet_status: 'installed',
			progress: 100,
			vaultpress_status: 'installed',
		};
		const action = receiveJetpackProductInstallStatus( siteId, status );
		const state = reducer( {}, action );

		expect( state ).toEqual( {
			[ siteId ]: status,
		} );
	} );

	test( 'should add installation status for the additional sites', () => {
		const siteId = 12345678;
		const status = {
			akismet_status: 'installed',
			progress: 100,
			vaultpress_status: 'installed',
		};
		const action = receiveJetpackProductInstallStatus( siteId, status );
		const originalState = {
			87654321: {
				akismet_status: 'key_not_set',
				progress: 60,
				vaultpress_status: 'key_not_set',
			},
		};
		const state = reducer( originalState, action );

		expect( state ).toEqual( {
			...originalState,
			[ siteId ]: status,
		} );
	} );

	test( 'should update installation status for known sites', () => {
		const siteId = 12345678;
		const status = {
			akismet_status: 'installed',
			progress: 100,
			vaultpress_status: 'installed',
		};
		const action = receiveJetpackProductInstallStatus( siteId, status );
		const originalState = {
			[ siteId ]: {
				akismet_status: 'key_not_set',
				progress: 60,
				vaultpress_status: 'key_not_set',
			},
		};
		const state = reducer( originalState, action );

		expect( state ).toEqual( {
			[ siteId ]: status,
		} );
	} );
} );
