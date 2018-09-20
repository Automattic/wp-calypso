/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import { withSchemaValidation } from 'state/utils';
import {
	WP_JOB_MANAGER_FETCH_ERROR,
	WP_JOB_MANAGER_FETCH_SETTINGS,
	WP_JOB_MANAGER_UPDATE_SETTINGS,
} from '../../action-types';
import reducer, { fetching, items as unvalidatedItems } from '../reducer';

const items = withSchemaValidation( unvalidatedItems.schema, unvalidatedItems );

describe( 'reducer', () => {
	test( 'should initialize to an empty object', () => {
		expect( reducer( undefined, { type: '@@UNKNOWN_ACTION' } ) ).to.eql( {} );
	} );

	describe( 'fetching()', () => {
		test( 'should default to false', () => {
			const state = fetching( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.eql( false );
		} );

		test( 'should set state to true if settings are being fetched', () => {
			const state = fetching( undefined, { type: WP_JOB_MANAGER_FETCH_SETTINGS } );

			expect( state ).to.eql( true );
		} );

		test( 'should set state to false if updating settings', () => {
			const state = fetching( undefined, { type: WP_JOB_MANAGER_UPDATE_SETTINGS } );

			expect( state ).to.eql( false );
		} );

		test( 'should set state to false if settings could not be fetched', () => {
			const state = fetching( undefined, { type: WP_JOB_MANAGER_FETCH_ERROR } );

			expect( state ).to.eql( false );
		} );
	} );

	describe( 'items()', () => {
		const data = { listings: { hideFilledPositions: true } };

		test( 'should default to an empty object', () => {
			const state = items( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should return settings if settings are being updated', () => {
			const state = items( undefined, { type: WP_JOB_MANAGER_UPDATE_SETTINGS, data } );

			expect( state ).to.deep.equal( data );
		} );

		test( 'should return an empty object if settings are not being updated', () => {
			const state = items( undefined, { type: '@@UNKNOWN_ACTION', data } );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				job_manager_per_page: 20,
				job_manager_hide_filled_positions: true,
				job_manager_hide_expired: true,
			} );
			const state = items( original, { type: SERIALIZE } );
			expect( state ).to.deep.equal( original );
		} );

		test( 'should restore valid persisted state', () => {
			const original = deepFreeze( {
				job_manager_per_page: 20,
				job_manager_hide_filled_positions: true,
				job_manager_hide_expired: true,
			} );
			const state = items( original, { type: DESERIALIZE } );
			expect( state ).to.deep.equal( original );
		} );

		test( 'should not restore invalid persisted state', () => {
			const original = deepFreeze( {
				job_manager_per_page: 'this should be an integer',
				job_manager_hide_filled_positions: true,
				job_manager_hide_expired: true,
			} );
			const state = items( original, { type: DESERIALIZE } );
			expect( state ).to.deep.equal( {} );
		} );
	} );
} );
