/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_FETCH_ERROR,
	WP_JOB_MANAGER_FETCH_SETTINGS,
	WP_JOB_MANAGER_SAVE_SETTINGS,
	WP_JOB_MANAGER_UPDATE_SETTINGS,
} from '../../action-types';
import { fetchError, fetchSettings, saveSettings, updateSettings } from '../actions';

describe( 'actions', () => {
	const siteId = 123456;
	const settings = {
		job_manager_per_page: 25,
		job_manager_hide_filled_positions: true,
	};

	describe( '#updateSettings()', () => {
		test( 'should return an action object', () => {
			const action = updateSettings( siteId, settings );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				data: settings,
				siteId,
			} );
		} );
	} );

	describe( '#fetchError()', () => {
		test( 'should return an action object', () => {
			const action = fetchError( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_FETCH_ERROR,
				siteId,
			} );
		} );
	} );

	describe( '#fetchSettings()', () => {
		test( 'should return an action object', () => {
			const action = fetchSettings( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_FETCH_SETTINGS,
				siteId,
			} );
		} );
	} );

	describe( '#saveSettings()', () => {
		test( 'should return an action object', () => {
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
