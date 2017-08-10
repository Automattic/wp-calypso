/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SITE_MEDIA_STORAGE_RECEIVE,
	SITE_MEDIA_STORAGE_REQUEST,
	SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
	SITE_MEDIA_STORAGE_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { withSchemaValidation } from 'state/utils';
import reducer, { items as unwrappedItems, fetchingItems } from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

const items = withSchemaValidation( unwrappedItems.schema, unwrappedItems );

describe( 'reducer', () => {
	let sandbox;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items', 'fetchingItems' ] );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index media-storage by site ID', () => {
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

		it( 'should accumulate media-storage for sites', () => {
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

		it( 'should override previous media-storage', () => {
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
			it( 'persists state', () => {
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

			it( 'loads valid persisted state', () => {
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

			it( 'loads default state when schema does not match', () => {
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
		it( 'should default to an empty object', () => {
			const state = fetchingItems( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index fetching state by site ID', () => {
			const state = fetchingItems( undefined, {
				type: SITE_MEDIA_STORAGE_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		it( 'should update fetching state by site ID on success', () => {
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

		it( 'should update fetching state by site ID on failure', () => {
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

		it( 'should accumulate fetchingItems by site ID', () => {
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
