/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_REQUEST_ERROR,
	ZONINATOR_UPDATE_ZONES,
	ZONINATOR_UPDATE_ZONE,
	ZONINATOR_ADD_ZONE,
} from '../../action-types';
import {
	requestZones,
	requestError,
	updateZones,
	updateZone,
	addZone,
} from '../actions';

describe( 'actions', () => {
	const siteId = 123456;
	const zones = [
		{
			name: 'Foo',
			description: 'A test zone.',
		},
		{
			name: 'Bar',
			description: 'Another zone.',
		},
	];

	describe( '#updateZones()', () => {
		it( 'should return an action object', () => {
			const action = updateZones( siteId, zones );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_UPDATE_ZONES,
				data: zones,
				siteId,
			} );
		} );
	} );

	describe( '#fetchZones()', () => {
		it( 'should return an action object', () => {
			const action = requestZones( siteId );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_REQUEST_ZONES,
				siteId,
			} );
		} );
	} );

	describe( '#fetchError', () => {
		it( 'should return an action object', () => {
			const action = requestError( siteId );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_REQUEST_ERROR,
				siteId,
			} );
		} );
	} );

	describe( '#updateZone', () => {
		it( 'should return an action object', () => {
			const action = updateZone( siteId, zones[ 0 ] );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_UPDATE_ZONE,
				data: zones[ 0 ],
				siteId,
			} );
		} );
	} );

	describe( '#addZone', () => {
		it( 'should return an action object', () => {
			const action = addZone( siteId, 'form', zones[ 0 ] );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_ADD_ZONE,
				data: zones[ 0 ],
				form: 'form',
				siteId,
			} );
		} );
	} );
} );
