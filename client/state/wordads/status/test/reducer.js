/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { WORDADS_STATUS_RECEIVE } from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should index settings by site ID', () => {
			const siteId = 2916284;
			const status = deepFreeze( {
				unsafe: 'mature',
				active: false,
			} );
			const state = items( undefined, {
				type: WORDADS_STATUS_RECEIVE,
				siteId,
				status: {
					unsafe: 'mature',
					active: false,
				},
			} );

			expect( state ).toEqual( {
				2916284: status,
			} );
		} );

		test( 'should override previous status', () => {
			const original = deepFreeze( {
				2916284: {
					unsafe: 'mature',
					active: false,
				},
				77203074: {
					unsafe: false,
				},
			} );
			const state = items( original, {
				type: WORDADS_STATUS_RECEIVE,
				status: {
					active: true,
				},
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: {
					active: true,
				},
				77203074: {
					unsafe: false,
				},
			} );
		} );

		test( 'should serialize and deserialize state', () => {
			const state = deepFreeze( {
				2916284: {
					unsafe: 'mature',
				},
				77203074: {
					unsafe: false,
				},
			} );

			expect( serialize( items, state ).root() ).toEqual( state );
			expect( deserialize( items, state ) ).toEqual( state );
		} );
	} );
} );
