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
	SITE_MEDIA_STORAGE_RECEIVE,
	SITE_MEDIA_STORAGE_REQUEST,
	SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
	SITE_MEDIA_STORAGE_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	let sandbox;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items', 'fetchingItems' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should index media-storage by site ID', () => {
			const siteId = 2916284;
			const mediaStorage = deepFreeze( {
				max_storage_bytes: -1,
				storage_used_bytes: -1,
			} );
			const state = items( undefined, {
				type: SITE_MEDIA_STORAGE_RECEIVE,
				mediaStorage,
				siteId,
			} );

			expect( state ).to.eql( {
				2916284: mediaStorage,
			} );
		} );

		test( 'should accumulate media-storage for sites', () => {
			const original = deepFreeze( {
				2916284: {
					max_storage_bytes: -1,
					storage_used_bytes: -1,
				},
			} );
			const state = items( original, {
				type: SITE_MEDIA_STORAGE_RECEIVE,
				mediaStorage: {
					max_storage_bytes: 3221225472,
					storage_used_bytes: 323506,
				},
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: {
					max_storage_bytes: -1,
					storage_used_bytes: -1,
				},
				77203074: {
					max_storage_bytes: 3221225472,
					storage_used_bytes: 323506,
				},
			} );
		} );

		test( 'should override previous media-storage', () => {
			const original = deepFreeze( {
				2916284: {
					max_storage_bytes: -1,
					storage_used_bytes: -1,
				},
				77203074: {
					max_storage_bytes: 3221225472,
					storage_used_bytes: 323506,
				},
			} );
			const state = items( original, {
				type: SITE_MEDIA_STORAGE_RECEIVE,
				mediaStorage: {
					max_storage_bytes: 3221225472,
					storage_used_bytes: 56000,
				},
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: {
					max_storage_bytes: 3221225472,
					storage_used_bytes: 56000,
				},
				77203074: {
					max_storage_bytes: 3221225472,
					storage_used_bytes: 323506,
				},
			} );
		} );

		describe( 'persistence', () => {
			test( 'persists state', () => {
				const original = deepFreeze( {
					2916284: {
						max_storage_bytes: 3221225472,
						storage_used_bytes: 56000,
					},
					77203074: {
						max_storage_bytes: 3221225472,
						storage_used_bytes: 323506,
					},
				} );
				const state = items( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			test( 'loads valid persisted state', () => {
				const original = deepFreeze( {
					2916284: {
						max_storage_bytes: 3221225472,
						storage_used_bytes: 56000,
					},
					77203074: {
						max_storage_bytes: 3221225472,
						storage_used_bytes: 323506,
					},
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( original );
			} );

			test( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					2916284: {
						max_storage_bytes: 3221225472,
						storage_used_bytes: 56000.2,
					},
					77203074: {
						max_storage_bytes: 3221225472,
						storage_used_bytes: 323506,
					},
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
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
				type: SITE_MEDIA_STORAGE_REQUEST,
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
				type: SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
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
				type: SITE_MEDIA_STORAGE_REQUEST_FAILURE,
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
				type: SITE_MEDIA_STORAGE_REQUEST,
				siteId: 77203074,
			} );
			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );
	} );
} );
