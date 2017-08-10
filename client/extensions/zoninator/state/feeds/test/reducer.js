/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { ZONINATOR_UPDATE_FEED } from '../../action-types';
import reducer, { items } from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 1234;
	const secondarySiteId = 4321;

	const primaryZoneId = 5678;
	const secondaryZoneId = 8765;

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
		] );
	} );

	describe( 'items()', () => {
		const primaryFeed = [ 1, 2, 3, 4, 5 ];
		const secondaryFeed = [ 101, 102, 103, 104, 105 ];

		const previousState = deepFreeze( {
			[ primarySiteId ]: {
				[ primaryZoneId ]: primaryFeed,
			},
		} );

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should index feeds by zoneUniqueId()', () => {
			const state = items( undefined, {
				type: ZONINATOR_UPDATE_FEED,
				siteId: primarySiteId,
				zoneId: primaryZoneId,
				data: primaryFeed,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZoneId ]: primaryFeed,
				},
			} );
		} );

		it( 'should accumulate zones of different site ID', () => {
			const state = items( previousState, {
				type: ZONINATOR_UPDATE_FEED,
				siteId: secondarySiteId,
				zoneId: primaryZoneId,
				data: secondaryFeed,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZoneId ]: primaryFeed,
				},
				[ secondarySiteId ]: {
					[ primaryZoneId ]: secondaryFeed,
				},
			} );
		} );

		it( 'should accumulate zones of different zone ID', () => {
			const state = items( previousState, {
				type: ZONINATOR_UPDATE_FEED,
				siteId: primarySiteId,
				zoneId: secondaryZoneId,
				data: secondaryFeed,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZoneId ]: primaryFeed,
					[ secondaryZoneId ]: secondaryFeed,
				},
			} );
		} );

		it( 'should override zones of the same site and zone ID', () => {
			const state = items( previousState, {
				type: ZONINATOR_UPDATE_FEED,
				siteId: primarySiteId,
				zoneId: primaryZoneId,
				data: secondaryFeed,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZoneId ]: secondaryFeed,
				},
			} );
		} );
	} );
} );
