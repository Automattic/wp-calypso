/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { WP_JOB_MANAGER_FETCH_ERROR, WP_JOB_MANAGER_FETCH_SETTINGS, WP_JOB_MANAGER_SAVE_SETTINGS, WP_JOB_MANAGER_UPDATE_SETTINGS } from '../../action-types';
import { fetchError, fetchSettings, saveSettings, updateSettings } from '../actions';

describe( 'actions', () => {
	const siteId = 123456;
	const settings = {
		job_manager_per_page: 25,
		job_manager_hide_filled_positions: true,
	};

	describe( '#updateSettings()', () => {
		it( 'should return an action object', () => {
			const action = updateSettings( siteId, settings );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				data: settings,
				siteId,
			} );
		} );
	} );

	describe( '#fetchError()', () => {
		it( 'should return an action object', () => {
			const action = fetchError( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_FETCH_ERROR,
				siteId,
			} );
		} );
	} );

	describe( '#fetchSettings()', () => {
		it( 'should return an action object', () => {
			const action = fetchSettings( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_FETCH_SETTINGS,
				siteId,
			} );
		} );
	} );

	describe( '#saveSettings()', () => {
		it( 'should return an action object', () => {
			const action = saveSettings( siteId, 'form', settings );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_SAVE_SETTINGS,
				data: settings,
				form: 'form',
				siteId,
			} );
		} );
	} );
} );
