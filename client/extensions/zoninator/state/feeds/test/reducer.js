/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_FEED,
	ZONINATOR_REQUEST_FEED_ERROR,
	ZONINATOR_UPDATE_FEED,
} from '../../action-types';
import reducer, { items, requesting } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'requesting', 'items' ] );
	} );

	describe( 'requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should set state to true if a feed is being requested', () => {
			const state = requesting( undefined, {
				type: ZONINATOR_REQUEST_FEED,
				siteId: 123,
				zoneId: 456,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: true,
				},
			} );
		} );

		it( 'should set state to false if updating a feed', () => {
			const state = requesting( undefined, {
				type: ZONINATOR_UPDATE_FEED,
				siteId: 123,
				zoneId: 456,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: false,
				},
			} );
		} );

		it( 'should set state to false if a feed could not be fetched', () => {
			const state = requesting( undefined, {
				type: ZONINATOR_REQUEST_FEED_ERROR,
				siteId: 123,
				zoneId: 456,
			} );

			expect( state ).to.deep.equal( {
				[ 123 ]: {
					[ 456 ]: false,
				},
			} );
		} );
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );
	} );
} );
