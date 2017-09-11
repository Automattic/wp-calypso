/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSitesItems } from '../';

describe( 'getSitesItems()', () => {
	it( 'should return site items if sites exist', () => {
		const state = {
			sites: {
				items: { 13434: { ID: 13434 } },
			},
		};
		expect( getSitesItems( state ) ).to.eql( { 13434: { ID: 13434 } } );
	} );

	it( 'should return empty object if site items are empty', () => {
		const state = {
			sites: {
				items: {},
			},
		};
		expect( getSitesItems( state ) ).to.eql( {} );
	} );

	it( 'should return empty object if site items are null (not loaded)', () => {
		const state = {
			sites: {
				items: null,
			},
		};
		expect( getSitesItems( state ) ).to.eql( {} );
	} );
} );
