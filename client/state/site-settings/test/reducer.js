import deepFreeze from 'deep-freeze';
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
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { items, requesting, saveRequests } from '../reducer';

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should set requesting value to true if request in progress', () => {
			const state = requesting( undefined, {
				type: SITE_SETTINGS_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: true,
			} );
		} );

		test( 'should accumulate requesting values', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( previousState, {
				type: SITE_SETTINGS_REQUEST,
				siteId: 2916285,
			} );

			expect( state ).toEqual( {
				2916284: true,
				2916285: true,
			} );
		} );

		test( 'should set request to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( previousState, {
				type: SITE_SETTINGS_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: false,
			} );
		} );

		test( 'should set request to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( previousState, {
				type: SITE_SETTINGS_REQUEST_FAILURE,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: false,
			} );
		} );
	} );

	describe( 'saveRequests()', () => {
		test( 'should default to an empty object', () => {
			const state = saveRequests( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should set request status to pending if request in progress', () => {
			const state = saveRequests( undefined, {
				type: SITE_SETTINGS_SAVE,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: { saving: true, status: 'pending', error: false },
			} );
		} );

		test( 'should accumulate save requests statuses', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending', error: false },
			} );
			const state = saveRequests( previousState, {
				type: SITE_SETTINGS_SAVE,
				siteId: 2916285,
			} );

			expect( state ).toEqual( {
				2916284: { saving: true, status: 'pending', error: false },
				2916285: { saving: true, status: 'pending', error: false },
			} );
		} );

		test( 'should set save request to success if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending', error: false },
			} );
			const state = saveRequests( previousState, {
				type: SITE_SETTINGS_SAVE_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: { saving: false, status: 'success', error: false },
			} );
		} );

		test( 'should set save request to error if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending', error: false },
			} );
			const state = saveRequests( previousState, {
				type: SITE_SETTINGS_SAVE_FAILURE,
				siteId: 2916284,
				error: 'my error',
			} );

			expect( state ).toEqual( {
				2916284: { saving: false, status: 'error', error: 'my error' },
			} );
		} );
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should index settings by site ID', () => {
			const settings = { default_category: 'cat' };
			const state = items( null, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).toEqual( {
				2916284: settings,
			} );
		} );

		test( 'should accumulate settings', () => {
			const settings = { default_category: 'chicken' };
			const previousState = deepFreeze( {
				2916284: { default_category: 'ribs' },
			} );
			const state = items( previousState, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916285,
				settings,
			} );

			expect( state ).toEqual( {
				2916284: { default_category: 'ribs' },
				2916285: settings,
			} );
		} );

		test( 'should override previous settings of same site ID', () => {
			const settings = { default_category: 'chicken' };
			const previousState = deepFreeze( {
				2916284: { default_category: 'ribs' },
			} );
			const state = items( previousState, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).toEqual( {
				2916284: settings,
			} );
		} );

		test( 'should accumulate new settings and overwrite existing ones for the same site ID', () => {
			const settings = { blogname: 'chicken', lang_id: 1 };
			const previousState = deepFreeze( {
				2916284: { blogdescription: 'ribs', blogname: 'name' },
			} );
			const state = items( previousState, {
				type: SITE_SETTINGS_UPDATE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).toEqual( {
				2916284: { blogdescription: 'ribs', blogname: 'chicken', lang_id: 1 },
			} );
		} );

		test( 'should return same state on media delete for untracked site', () => {
			const previousState = deepFreeze( {} );
			const state = items( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ],
			} );

			expect( state ).toEqual( previousState );
		} );

		test( 'should return same state on media delete if set does not contain icon setting', () => {
			const previousState = deepFreeze( {
				2916284: {
					blogname: 'Example',
					site_icon: 42,
				},
			} );
			const state = items( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 36 ],
			} );

			expect( state ).toEqual( previousState );
		} );

		test( 'should unset icon setting on media delete if set contains icon', () => {
			const previousState = deepFreeze( {
				2916284: {
					blogname: 'Example',
					site_icon: 42,
				},
			} );
			const state = items( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ],
			} );

			expect( state ).toEqual( {
				2916284: {
					blogname: 'Example',
					site_icon: null,
				},
			} );
		} );

		test( 'should persist state', () => {
			const previousState = deepFreeze( {
				2916284: { default_category: 'cat' },
			} );
			const state = serialize( items, previousState );

			expect( state ).toEqual( {
				2916284: { default_category: 'cat' },
			} );
		} );

		test( 'should load valid persisted state', () => {
			const previousState = deepFreeze( {
				2916284: { default_category: 'cat' },
			} );
			const state = deserialize( items, previousState );

			expect( state ).toEqual( {
				2916284: { default_category: 'cat' },
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				2454: 2,
			} );
			const state = deserialize( items, previousInvalidState );

			expect( state ).toEqual( {} );
		} );
	} );
} );
