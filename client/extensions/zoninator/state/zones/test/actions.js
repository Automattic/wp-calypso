/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	ZONINATOR_FETCH_ZONES,
	ZONINATOR_FETCH_ERROR,
	ZONINATOR_UPDATE_ZONES,
} from '../../action-types';
import {
	fetchZones,
	fetchError,
	updateZones,
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
			const action = fetchZones( siteId );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_FETCH_ZONES,
				siteId,
			} );
		} );
	} );

	describe( '#fetchError', () => {
		it( 'should return an action object', () => {
			const action = fetchError( siteId );

			expect( action ).to.deep.equal( {
				type: ZONINATOR_FETCH_ERROR,
				siteId,
			} );
		} );
	} );
} );
