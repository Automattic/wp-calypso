/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_DISPLAY_SETTINGS,
	WP_JOB_MANAGER_ENABLE_SETTINGS,
	WP_JOB_MANAGER_FETCH_SETTINGS,
} from '../../action-types';
import {
	displaySettings,
	enableSettings,
	fetchSettings,
} from '../actions';

describe( 'actions', () => {
	const siteId = 123456;
	const settings = {
		data: {
			job_manager_per_page: 25,
			job_manager_hide_filled_positions: true,
		}
	};

	describe( '#displaySettings()', () => {
		it( 'should return an action object', () => {
			const action = displaySettings( siteId, settings.data );

			expect( action ).to.eql( {
				type: WP_JOB_MANAGER_DISPLAY_SETTINGS,
				data: settings.data,
				siteId,
			} );
		} );
	} );

	describe( '#enableSettings()', () => {
		it( 'should return an action object', () => {
			const action = enableSettings( siteId );

			expect( action ).to.eql( {
				type: WP_JOB_MANAGER_ENABLE_SETTINGS,
				siteId,
			} );
		} );
	} );

	describe( '#fetchSettings()', () => {
		it( 'should return an action object', () => {
			const action = fetchSettings( siteId );

			expect( action ).to.eql( {
				type: WP_JOB_MANAGER_FETCH_SETTINGS,
				siteId,
			} );
		} );
	} );
} );
