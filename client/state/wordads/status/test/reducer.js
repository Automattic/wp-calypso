/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items, fetchingItems } from '../reducer';
import {
	WORDADS_STATUS_REQUEST,
	WORDADS_STATUS_REQUEST_SUCCESS,
	WORDADS_STATUS_REQUEST_FAILURE,
} from 'client/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items', 'fetchingItems' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should index settings by site ID', () => {
			const siteId = 2916284;
			const status = deepFreeze( {
				unsafe: 'mature',
				active: false,
			} );
			const state = items( undefined, {
				type: WORDADS_STATUS_REQUEST_SUCCESS,
				siteId,
				status: {
					unsafe: 'mature',
					active: false,
				},
			} );

			expect( state ).to.eql( {
				2916284: status,
			} );
		} );

		test( 'should override previous status', () => {
			const original = deepFreeze( {
				2916284: {
					unsafe: 'mature',
					active: false,
				},
				77203074: {
					unsafe: false,
				},
			} );
			const state = items( original, {
				type: WORDADS_STATUS_REQUEST_SUCCESS,
				status: {
					active: true,
				},
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: {
					active: true,
				},
				77203074: {
					unsafe: false,
				},
			} );
		} );
	} );

	describe( '#fetchingItems()', () => {
		test( 'should default to an empty object', () => {
			const state = fetchingItems( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should index fetching state by site ID', () => {
			const state = fetchingItems( undefined, {
				type: WORDADS_STATUS_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should update fetching state by site ID on success', () => {
			const originalState = deepFreeze( {
				2916284: true,
			} );
			const state = fetchingItems( originalState, {
				type: WORDADS_STATUS_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
			} );
		} );

		test( 'should update fetching state by site ID on failure', () => {
			const originalState = deepFreeze( {
				2916284: true,
			} );
			const state = fetchingItems( originalState, {
				type: WORDADS_STATUS_REQUEST_FAILURE,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
			} );
		} );

		test( 'should accumulate fetchingItems by site ID', () => {
			const originalState = deepFreeze( {
				2916284: false,
			} );
			const state = fetchingItems( originalState, {
				type: WORDADS_STATUS_REQUEST,
				siteId: 77203074,
			} );
			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );
	} );
} );
