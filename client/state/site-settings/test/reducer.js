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
import { items, requesting, saving } from '../reducer';

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

	describe( 'saving()', () => {
		it( 'should default to an empty object', () => {
			const state = saving( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set requesting value to true if request in progress', () => {
			const state = saving( undefined, {
				type: SITE_SETTINGS_SAVE,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should accumulate saving values', () => {
			const previousState = deepFreeze( {
				2916284: true
			} );
			const state = saving( previousState, {
				type: SITE_SETTINGS_SAVE,
				siteId: 2916285
			} );

			expect( state ).to.eql( {
				2916284: true,
				2916285: true
			} );
		} );

		it( 'should set save request to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: true
			} );
			const state = saving( previousState, {
				type: SITE_SETTINGS_SAVE_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false
			} );
		} );

		it( 'should set save request to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: true
			} );
			const state = saving( previousState, {
				type: SITE_SETTINGS_SAVE_FAILURE,
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
			const state = saving( previousState, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const previousState = deepFreeze( {
				2916284: true
			} );
			const state = saving( previousState, {
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
