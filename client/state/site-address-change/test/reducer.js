import {
	SITE_ADDRESS_CHANGE_REQUEST,
	SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
	SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { requesting } from '../reducer';

describe( 'reducer', () => {
	const siteId = 2916284;

	describe( 'requesting()', () => {
		test( 'it defaults to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		describe( 'when a SITE_ADDRESS_CHANGE_REQUEST action is dispatched', () => {
			test( 'it will be true', () => {
				const state = requesting( undefined, {
					type: SITE_ADDRESS_CHANGE_REQUEST,
					siteId,
				} );

				expect( state ).toEqual( {
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

				expect( state ).toEqual( {
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

				expect( state ).toEqual( {
					[ siteId ]: false,
				} );
			} );
		} );
	} );
} );
