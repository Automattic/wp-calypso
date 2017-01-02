/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	MEDIA_DELETE,
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_REQUEST_FAILURE,
	SITE_SETTINGS_REQUEST_SUCCESS,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS,
	SITE_SETTINGS_UPDATE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { items, requesting, saveRequests } from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set requesting value to true if request in progress', () => {
			const state = requesting( undefined, {
				type: SITE_SETTINGS_REQUEST,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const previousState = deepFreeze( {
				2916284: true
			} );
			const state = requesting( previousState, {
				type: SITE_SETTINGS_REQUEST,
				siteId: 2916285
			} );

			expect( state ).to.eql( {
				2916284: true,
				2916285: true
			} );
		} );

		it( 'should set request to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: true
			} );
			const state = requesting( previousState, {
				type: SITE_SETTINGS_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: true
			} );
			const state = requesting( previousState, {
				type: SITE_SETTINGS_REQUEST_FAILURE,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false
			} );
		} );

		it( 'should not persist state', () => {
			const previousState = deepFreeze( {
				2916284: true
			} );
			const state = requesting( previousState, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const previousState = deepFreeze( {
				2916284: true
			} );
			const state = requesting( previousState, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'saveRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = saveRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set request status to pending if request in progress', () => {
			const state = saveRequests( undefined, {
				type: SITE_SETTINGS_SAVE,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: { saving: true, status: 'pending', error: false }
			} );
		} );

		it( 'should accumulate save requests statuses', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequests( previousState, {
				type: SITE_SETTINGS_SAVE,
				siteId: 2916285
			} );

			expect( state ).to.eql( {
				2916284: { saving: true, status: 'pending', error: false },
				2916285: { saving: true, status: 'pending', error: false }
			} );
		} );

		it( 'should set save request to success if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequests( previousState, {
				type: SITE_SETTINGS_SAVE_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: { saving: false, status: 'success', error: false }
			} );
		} );

		it( 'should set save request to error if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequests( previousState, {
				type: SITE_SETTINGS_SAVE_FAILURE,
				siteId: 2916284,
				error: 'my error'
			} );

			expect( state ).to.eql( {
				2916284: { saving: false, status: 'error', error: 'my error' }
			} );
		} );

		it( 'should not persist state', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequests( previousState, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequests( previousState, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index settings by site ID', () => {
			const settings = { default_category: 'cat' };
			const state = items( null, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings
			} );

			expect( state ).to.eql( {
				2916284: settings
			} );
		} );

		it( 'should accumulate settings', () => {
			const settings = { default_category: 'chicken' };
			const previousState = deepFreeze( {
				2916284: { default_category: 'ribs' }
			} );
			const state = items( previousState, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916285,
				settings
			} );

			expect( state ).to.eql( {
				2916284: { default_category: 'ribs' },
				2916285: settings
			} );
		} );

		it( 'should override previous settings of same site ID', () => {
			const settings = { default_category: 'chicken' };
			const previousState = deepFreeze( {
				2916284: { default_category: 'ribs' }
			} );
			const state = items( previousState, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings
			} );

			expect( state ).to.eql( {
				2916284: settings
			} );
		} );

		it( 'should accumulate new settings and overwrite existing ones for the same site ID', () => {
			const settings = { blogname: 'chicken', lang_id: 1 };
			const previousState = deepFreeze( {
				2916284: { blogdescription: 'ribs', blogname: 'name' }
			} );
			const state = items( previousState, {
				type: SITE_SETTINGS_UPDATE,
				siteId: 2916284,
				settings
			} );

			expect( state ).to.eql( {
				2916284: { blogdescription: 'ribs', blogname: 'chicken', lang_id: 1 }
			} );
		} );

		it( 'should return same state on media delete for untracked site', () => {
			const previousState = deepFreeze( {} );
			const state = items( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ]
			} );

			expect( state ).to.equal( previousState );
		} );

		it( 'should return same state on media delete if set does not contain icon setting', () => {
			const previousState = deepFreeze( {
				2916284: {
					blogname: 'Example',
					site_icon: 42
				}
			} );
			const state = items( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 36 ]
			} );

			expect( state ).to.equal( previousState );
		} );

		it( 'should unset icon setting on media delete if set contains icon', () => {
			const previousState = deepFreeze( {
				2916284: {
					blogname: 'Example',
					site_icon: 42
				}
			} );
			const state = items( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ]
			} );

			expect( state ).to.eql( {
				2916284: {
					blogname: 'Example',
					site_icon: null
				}
			} );
		} );

		it( 'should persist state', () => {
			const previousState = deepFreeze( {
				2916284: { default_category: 'cat' }
			} );
			const state = items( previousState, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: { default_category: 'cat' }
			} );
		} );

		it( 'should load valid persisted state', () => {
			const previousState = deepFreeze( {
				2916284: { default_category: 'cat' }
			} );
			const state = items( previousState, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: { default_category: 'cat' }
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				2454: 2
			} );
			const state = items( previousInvalidState, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
