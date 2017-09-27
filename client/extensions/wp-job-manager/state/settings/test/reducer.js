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
	WP_JOB_MANAGER_UPDATE_SETTINGS,
} from '../../action-types';
import reducer, { fetching, items } from '../reducer';

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
	} );
} );
