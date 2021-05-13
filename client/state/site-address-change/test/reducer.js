/* eslint-disable jest/no-identical-title */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SITE_ADDRESS_CHANGE_REQUEST,
	SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
	SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { status, requesting } from '../reducer';

describe( 'reducer', () => {
	const siteId = 2916284;

	describe( 'requesting()', () => {
		test( 'it defaults to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		describe( 'when a SITE_ADDRESS_CHANGE_REQUEST action is dispatched', () => {
			test( 'it will be true', () => {
				const state = requesting( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST,
					siteId,
				} );

				expect( state ).to.eql( {
					[ siteId ]: true,
				} );
			} );
		} );

		describe( 'when a SITE_ADDRESS_CHANGE_REQUEST_SUCCESS action is dispatched', () => {
			test( 'it will be false', () => {
				const state = requesting( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
					siteId,
				} );

				expect( state ).to.eql( {
					[ siteId ]: false,
				} );
			} );
		} );

		describe( 'when a SITE_ADDRESS_CHANGE_REQUEST_FAILURE action is dispatched', () => {
			test( 'it will be false', () => {
				const state = requesting( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
					siteId,
				} );

				expect( state ).to.eql( {
					[ siteId ]: false,
				} );
			} );
		} );
	} );

	describe( 'status()', () => {
		test( 'it defaults to an empty object', () => {
			const state = status( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		describe( 'when a SITE_ADDRESS_CHANGE_REQUEST action is dispatched', () => {
			test( 'it will have a status property of "pending"', () => {
				const state = status( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST,
					siteId,
				} );
				const siteState = state[ siteId ];

				expect( siteState.status ).to.eql( 'pending' );
			} );

			test( 'it will have an error property of "false"', () => {
				const state = status( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST,
					siteId,
				} );
				const siteState = state[ siteId ];

				expect( siteState.error ).to.eql( false );
			} );
		} );

		describe( 'when a SITE_ADDRESS_CHANGE_REQUEST_SUCCESS action is dispatched', () => {
			test( 'it will have a status property of "success"', () => {
				const state = status( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
					siteId,
				} );
				const siteState = state[ siteId ];

				expect( siteState.status ).to.eql( 'success' );
			} );

			test( 'it will have a status property of "success"', () => {
				const state = status( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
					siteId,
				} );
				const siteState = state[ siteId ];

				expect( siteState.error ).to.eql( false );
			} );
		} );

		describe( 'when a SITE_ADDRESS_CHANGE_REQUEST_FAILURE action is dispatched', () => {
			test( 'it will have a status property of "error"', () => {
				const state = status( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
					siteId,
				} );
				const siteState = state[ siteId ];

				expect( siteState.status ).to.eql( 'error' );
			} );

			test( 'it will have a error property with the value of the passed error', () => {
				const error = 'some-error';
				const state = status( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
					siteId,
					error,
				} );
				const siteState = state[ siteId ];

				expect( siteState.error ).to.eql( error );
			} );
		} );
	} );
} );
