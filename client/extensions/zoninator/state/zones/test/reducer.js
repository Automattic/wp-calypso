/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_ERROR,
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_UPDATE_ZONE,
	ZONINATOR_UPDATE_ZONES,
} from '../../action-types';
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import reducer, { requesting, items } from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 234567;

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items',
		] );
	} );

	describe( 'requesting()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should set state to true if zones are being fetched', () => {
			const state = requesting( undefined, {
				type: ZONINATOR_REQUEST_ZONES,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const state = requesting( previousState, {
				type: ZONINATOR_REQUEST_ZONES,
				siteId: secondarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set state to false if updating zones', () => {
			const state = requesting( previousState, {
				type: ZONINATOR_UPDATE_ZONES,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set state to false if zones could not be fetched', () => {
			const state = requesting( previousState, {
				type: ZONINATOR_REQUEST_ERROR,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should not persist state', () => {
			const state = requesting( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = requesting( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( 'items()', () => {
		const primaryZone = {
			term_id: 1,
			name: 'Test zone',
			description: 'A test zone',
			slug: 'test-zone',
		};
		const secondaryZone = {
			term_id: 2,
			name: 'Test zone 2',
			description: 'Another test zone',
		};

		const previousState = deepFreeze( {
			[ primarySiteId ]: {
				[ primaryZone.term_id ]: primaryZone,
			},
		} );

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should index zones by site ID and zone ID', () => {
			const state = items( undefined, {
				type: ZONINATOR_UPDATE_ZONES,
				siteId: primarySiteId,
				data: {
					[ primaryZone.term_id ]: primaryZone,
				},
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZone.term_id ]: primaryZone,
				},
			} );
		} );

		it( 'should accumulate zones of different site ID', () => {
			const state = items( previousState, {
				type: ZONINATOR_UPDATE_ZONES,
				siteId: secondarySiteId,
				data: {
					[ secondaryZone.term_id ]: secondaryZone,
				},
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZone.term_id ]: primaryZone,
				},
				[ secondarySiteId ]: {
					[ secondaryZone.term_id ]: secondaryZone,
				},
			} );
		} );

		it( 'should override previous zones of the same site ID', () => {
			const state = items( previousState, {
				type: ZONINATOR_UPDATE_ZONES,
				siteId: primarySiteId,
				data: {
					[ secondaryZone.term_id ]: secondaryZone,
				},
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ secondaryZone.term_id ]: secondaryZone,
				},
			} );
		} );

		it( 'should initialize zones array for a site ID after the first zone is added', () => {
			const state = items( undefined, {
				type: ZONINATOR_UPDATE_ZONE,
				siteId: primarySiteId,
				zoneId: primaryZone.term_id,
				data: primaryZone,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZone.term_id ]: primaryZone,
				},
			} );
		} );

		it( 'should accumulate zones of the same site ID', () => {
			const state = items( previousState, {
				type: ZONINATOR_UPDATE_ZONE,
				siteId: primarySiteId,
				zoneId: secondaryZone.term_id,
				data: secondaryZone,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZone.term_id ]: primaryZone,
					[ secondaryZone.term_id ]: secondaryZone,
				},
			} );
		} );

		it( 'should update zones of the same site and zone ID', () => {
			const updatedZone = {
				term_id: primaryZone.term_id,
				name: 'Updated zone',
				slug: 'updated-zone',
				description: 'This zone has been updated.',
			};

			const state = items( previousState, {
				type: ZONINATOR_UPDATE_ZONE,
				siteId: primarySiteId,
				zoneId: updatedZone.term_id,
				data: updatedZone,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZone.term_id ]: updatedZone,
				},
			} );
		} );

		it( 'should persist state', () => {
			const state = items( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZone.term_id ]: primaryZone,
				},
			} );
		} );

		it( 'should load valid persisted state', () => {
			const state = items( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: {
					[ primaryZone.term_id ]: primaryZone,
				}
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				[ primarySiteId ]: 2,
			} );

			const state = items( previousInvalidState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );
} );
