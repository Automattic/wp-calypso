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
import reducer, { fetching, itemsReducer } from '../reducer';

describe( 'reducer', () => {
	it( 'should initialize to an empty object', () => {
		expect( reducer( undefined, { type: '@@UNKNOWN_ACTION' } ) ).to.eql( {} );
	} );

	describe( 'fetching()', () => {
		it( 'should default to false', () => {
			const state = fetching( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.eql( false );
		} );

		it( 'should set state to true if settings are being fetched', () => {
			const state = fetching( undefined, { type: WP_JOB_MANAGER_FETCH_SETTINGS } );

			expect( state ).to.eql( true );
		} );

		it( 'should set state to false if updating settings', () => {
			const state = fetching( undefined, { type: WP_JOB_MANAGER_UPDATE_SETTINGS } );

			expect( state ).to.eql( false );
		} );

		it( 'should set state to false if settings could not be fetched', () => {
			const state = fetching( undefined, { type: WP_JOB_MANAGER_FETCH_ERROR } );

			expect( state ).to.eql( false );
		} );
	} );

	describe( 'itemsReducer()', () => {
		const data = { listings: { hideFilledPositions: true } };

		it( 'should default to an empty object', () => {
			const state = itemsReducer( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should return settings if settings are being updated', () => {
			const state = itemsReducer( undefined, { type: WP_JOB_MANAGER_UPDATE_SETTINGS, data } );

			expect( state ).to.deep.equal( data );
		} );

		it( 'should return an empty object if settings are not being updated', () => {
			const state = itemsReducer( undefined, { type: '@@UNKNOWN_ACTION', data } );

			expect( state ).to.deep.equal( {} );
		} );
	} );
} );
