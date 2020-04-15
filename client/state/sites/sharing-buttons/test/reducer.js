/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, requesting, saveRequests } from '../reducer';
import {
	SHARING_BUTTONS_RECEIVE,
	SHARING_BUTTONS_REQUEST,
	SHARING_BUTTONS_REQUEST_FAILURE,
	SHARING_BUTTONS_REQUEST_SUCCESS,
	SHARING_BUTTONS_SAVE,
	SHARING_BUTTONS_SAVE_FAILURE,
	SHARING_BUTTONS_SAVE_SUCCESS,
	SHARING_BUTTONS_UPDATE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set requesting value to true if request in progress', () => {
			const state = requesting( undefined, {
				type: SHARING_BUTTONS_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should accumulate requesting values', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( previousState, {
				type: SHARING_BUTTONS_REQUEST,
				siteId: 2916285,
			} );

			expect( state ).to.eql( {
				2916284: true,
				2916285: true,
			} );
		} );

		test( 'should set request to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( previousState, {
				type: SHARING_BUTTONS_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
			} );
		} );

		test( 'should set request to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( previousState, {
				type: SHARING_BUTTONS_REQUEST_FAILURE,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
			} );
		} );

		test( 'should not persist state', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'saveRequests()', () => {
		test( 'should default to an empty object', () => {
			const state = saveRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set request status to pending if request in progress', () => {
			const state = saveRequests( undefined, {
				type: SHARING_BUTTONS_SAVE,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: { saving: true, status: 'pending' },
			} );
		} );

		test( 'should accumulate save requests statuses', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending' },
			} );
			const state = saveRequests( previousState, {
				type: SHARING_BUTTONS_SAVE,
				siteId: 2916285,
			} );

			expect( state ).to.eql( {
				2916284: { saving: true, status: 'pending' },
				2916285: { saving: true, status: 'pending' },
			} );
		} );

		test( 'should set save request to success if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending' },
			} );
			const state = saveRequests( previousState, {
				type: SHARING_BUTTONS_SAVE_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: { saving: false, status: 'success' },
			} );
		} );

		test( 'should set save request to error if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending' },
			} );
			const state = saveRequests( previousState, {
				type: SHARING_BUTTONS_SAVE_FAILURE,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: { saving: false, status: 'error' },
			} );
		} );

		test( 'should not persist state', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending' },
			} );
			const state = saveRequests( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const previousState = deepFreeze( {
				2916284: { saving: true, status: 'pending' },
			} );
			const state = saveRequests( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should index settings by site ID', () => {
			const settings = [ { ID: 'facebook', name: 'Facebook' } ];
			const state = items( null, {
				type: SHARING_BUTTONS_RECEIVE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).to.eql( {
				2916284: settings,
			} );
		} );

		test( 'should accumulate settings', () => {
			const settings = [ { ID: 'facebook', name: 'Facebook' } ];
			const previousState = deepFreeze( {
				2916284: [ { ID: 'twitter', name: 'Twitter' } ],
			} );
			const state = items( previousState, {
				type: SHARING_BUTTONS_RECEIVE,
				siteId: 2916285,
				settings,
			} );

			expect( state ).to.eql( {
				2916284: [ { ID: 'twitter', name: 'Twitter' } ],
				2916285: settings,
			} );
		} );

		test( 'should override previous settings of same site ID', () => {
			const settings = [ { ID: 'facebook', name: 'Facebook' } ];
			const previousState = deepFreeze( {
				2916284: [ { ID: 'twitter', name: 'Twitter' } ],
			} );
			const state = items( previousState, {
				type: SHARING_BUTTONS_RECEIVE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).to.eql( {
				2916284: settings,
			} );
		} );

		test( 'should accumulate new settings and overwrite existing ones for the same site ID', () => {
			const settings = [
				{ ID: 'facebook', name: 'New Facebook' },
				{ ID: 'twitter', name: 'Twitter' },
			];
			const previousState = deepFreeze( {
				2916284: [
					{ ID: 'facebook', name: 'Facebook' },
					{ ID: 'pinterest', name: 'Pinterest' },
				],
			} );
			const state = items( previousState, {
				type: SHARING_BUTTONS_UPDATE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).to.eql( {
				2916284: [
					{ ID: 'facebook', name: 'New Facebook' },
					{ ID: 'twitter', name: 'Twitter' },
					{ ID: 'pinterest', name: 'Pinterest' },
				],
			} );
		} );

		test( 'should persist state', () => {
			const previousState = deepFreeze( {
				2916284: [ { ID: 'facebook', name: 'Facebook' } ],
			} );
			const state = items( previousState, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: [ { ID: 'facebook', name: 'Facebook' } ],
			} );
		} );

		test( 'should load valid persisted state', () => {
			const previousState = deepFreeze( {
				2916284: [ { ID: 'facebook', name: 'Facebook' } ],
			} );
			const state = items( previousState, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: [ { ID: 'facebook', name: 'Facebook' } ],
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				2454: 2,
			} );
			const state = items( previousInvalidState, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
