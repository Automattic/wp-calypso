/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { ZONINATOR_UPDATE_LOCK } from '../../action-types';
import reducer, { items } from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items' ] );
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should set `created` to the current date when updating a lock', () => {
			const created = new Date();
			const state = items( undefined, {
				type: ZONINATOR_UPDATE_LOCK,
				siteId: 123,
				zoneId: 456,
				currentSession: true,
				created,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: {
						currentSession: true,
						created,
					},
				},
			} );
		} );
	} );
} );
