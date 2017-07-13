/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_REQUEST_SETTINGS,
	WP_JOB_MANAGER_REQUEST_SETTINGS_ERROR,
	WP_JOB_MANAGER_SAVE_ERROR,
	WP_JOB_MANAGER_SAVE_SETTINGS,
	WP_JOB_MANAGER_SAVE_SUCCESS,
	WP_JOB_MANAGER_UPDATE_SETTINGS,
} from '../../action-types';
import {
	requestSettings,
	requestSettingsError,
	saveError,
	saveSettings,
	saveSuccess,
	updateSettings,
} from '../actions';

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

	describe( '#requestSettingsError()', () => {
		it( 'should return an action object', () => {
			const action = requestSettingsError( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_REQUEST_SETTINGS_ERROR,
				siteId,
			} );
		} );
	} );

	describe( '#requestSettings()', () => {
		it( 'should return an action object', () => {
			const action = requestSettings( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_REQUEST_SETTINGS,
				siteId,
			} );
		} );
	} );

	describe( '#saveSettings()', () => {
		it( 'should return an action object', () => {
			const action = saveSettings( siteId, settings );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_SAVE_SETTINGS,
				data: settings,
				siteId,
			} );
		} );
	} );

	describe( '#saveError()', () => {
		it( 'should return an action object', () => {
			const action = saveError( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_SAVE_ERROR,
				siteId,
			} );
		} );
	} );

	describe( '#saveSuccess()', () => {
		it( 'should return an action object', () => {
			const action = saveSuccess( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_SAVE_SUCCESS,
				siteId,
			} );
		} );
	} );
} );
