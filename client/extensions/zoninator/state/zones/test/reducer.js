/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_REQUEST_ERROR,
	ZONINATOR_UPDATE_ZONES,
	ZONINATOR_UPDATE_ZONE,
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

	describe( 'requesting', () => {
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
		const primaryZones = [ {
			term_id: 1,
			name: 'Test zone',
			description: 'A test zone',
			slug: 'test-zone',
		} ];
		const secondaryZones = [ {
			term_id: 2,
			name: 'Test zone 2',
			description: 'Another test zone',
		} ];

		const previousState = deepFreeze( {
			[ primarySiteId ]: primaryZones,
		} );

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should index zones by site ID', () => {
			const state = items( undefined, {
				type: ZONINATOR_UPDATE_ZONES,
				siteId: primarySiteId,
				data: primaryZones,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primaryZones,
			} );
		} );

		it( 'should accumulate zones', () => {
			const state = items( previousState, {
				type: ZONINATOR_UPDATE_ZONES,
				siteId: secondarySiteId,
				data: secondaryZones,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primaryZones,
				[ secondarySiteId ]: secondaryZones,
			} );
		} );

		it( 'should override previous zones of the same site ID', () => {
			const state = items( previousState, {
				type: ZONINATOR_UPDATE_ZONES,
				siteId: primarySiteId,
				data: secondaryZones,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: secondaryZones,
			} );
		} );

		it( 'should initiate zones array for a site ID after the first zone is added', () => {
			const state = items( undefined, {
				type: ZONINATOR_UPDATE_ZONE,
				siteId: primarySiteId,
				data: primaryZones[ 0 ],
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primaryZones,
			} );
		} );

		it( 'should append new zones to existing zones of the same site ID', () => {
			const state = items( previousState, {
				type: ZONINATOR_UPDATE_ZONE,
				siteId: primarySiteId,
				data: secondaryZones[ 0 ],
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: [
					primaryZones[ 0 ],
					secondaryZones[ 0 ],
				],
			} );
		} );

		it( 'should update zones of the same site ID with the same term_id', () => {
			const updatedZone = {
				term_id: primaryZones[ 0 ].term_id,
				name: 'Updated zone',
				slug: 'updated-zone',
				description: 'This zone has been updated.',
			};

			const state = items( previousState, {
				type: ZONINATOR_UPDATE_ZONE,
				siteId: primarySiteId,
				data: updatedZone,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: [ updatedZone ],
			} );
		} );

		it( 'should persist state', () => {
			const state = items( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primaryZones,
			} );
		} );

		it( 'should load valid persisted state', () => {
			const state = items( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primaryZones,
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
