import deepFreeze from 'deep-freeze';
import { SITE_MEDIA_STORAGE_RECEIVE } from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { useSandbox } from 'calypso/test-helpers/use-sinon';
import reducer, { items } from '../reducer';

describe( 'reducer', () => {
	let sandbox;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [ 'items' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
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

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {
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
				const state = serialize( items, original );
				expect( state ).toEqual( original );
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
				const state = deserialize( items, original );
				expect( state ).toEqual( original );
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
				const state = deserialize( items, original );
				expect( state ).toEqual( {} );
			} );
		} );
	} );
} );
