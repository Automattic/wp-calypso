/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { WORDADS_STATUS_RECEIVE } from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
				2916284: {
					active: true,
				},
				77203074: {
					unsafe: false,
				},
			} );
		} );
	} );
} );
