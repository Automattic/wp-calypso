import deepFreeze from 'deep-freeze';
import {
	SITE_CONNECTION_STATUS_RECEIVE,
	SITE_CONNECTION_STATUS_REQUEST,
	SITE_CONNECTION_STATUS_REQUEST_FAILURE,
	SITE_CONNECTION_STATUS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import reducer, { items, requesting } from '../reducer';

describe( 'reducer', () => {
	beforeAll( () => {
		jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'items', 'requesting' ] )
		);
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should store connection status when received', () => {
			const state = items( undefined, {
				type: SITE_CONNECTION_STATUS_RECEIVE,
				siteId: 2916284,
				status: true,
			} );

			expect( state ).toEqual( {
				2916284: true,
			} );
		} );

		test( 'should accumulate connection statuses when receiving for new sites', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = items( original, {
				type: SITE_CONNECTION_STATUS_RECEIVE,
				siteId: 77203074,
				status: false,
			} );

			expect( state ).toEqual( {
				2916284: true,
				77203074: false,
			} );
		} );

		test( 'should overwrite connection status when receiving for an existing site', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: false,
			} );
			const state = items( original, {
				type: SITE_CONNECTION_STATUS_RECEIVE,
				siteId: 2916284,
				status: false,
			} );

			expect( state ).toEqual( {
				2916284: false,
				77203074: false,
			} );
		} );
	} );

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track connection status request when started', () => {
			const state = requesting( undefined, {
				type: SITE_CONNECTION_STATUS_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: true,
			} );
		} );

		test( 'should accumulate connection status requests when started', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: SITE_CONNECTION_STATUS_REQUEST,
				siteId: 77203074,
			} );

			expect( state ).toEqual( {
				2916284: true,
				77203074: true,
			} );
		} );

		test( 'should track connection status request when succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true,
			} );
			const state = requesting( original, {
				type: SITE_CONNECTION_STATUS_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: false,
				77203074: true,
			} );
		} );

		test( 'should track connection status request when failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true,
			} );
			const state = requesting( original, {
				type: SITE_CONNECTION_STATUS_REQUEST_FAILURE,
				siteId: 77203074,
			} );

			expect( state ).toEqual( {
				2916284: false,
				77203074: false,
			} );
		} );
	} );
} );
