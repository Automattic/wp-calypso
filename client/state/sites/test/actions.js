/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SITE_DELETE,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITES_RECEIVE,
	SITES_UPDATE,
	SITES_REQUEST
} from 'state/action-types';
import {
	deleteSite,
	receiveSite,
	receiveSites,
	receiveSiteUpdates,
	requestSites,
	requestSite
} from '../actions';

describe( 'actions', () => {
	describe( '#receiveSite()', () => {
		it( 'should return an action object', () => {
			const site = { ID: 2916284, name: 'WordPress.com Example Blog' };
			const action = receiveSite( site );

			expect( action ).to.eql( {
				type: SITE_RECEIVE,
				site
			} );
		} );
	} );
	describe( '#receiveSites()', () => {
		it( 'should return an action object', () => {
			const sites = [
				{ ID: 2916284, name: 'WordPress.com Example Blog' },
				{ ID: 77203074, name: 'WordPress.com Example Blog 2' }
			];
			const action = receiveSites( sites );
			expect( action ).to.eql( {
				type: SITES_RECEIVE,
				sites
			} );
		} );
	} );

	describe( 'receiveSiteUpdates()', () => {
		it( 'should return an action object', () => {
			const sites = [ { ID: 2916284, name: 'WordPress.com Example Blog' } ];

			const action = receiveSiteUpdates( sites );

			expect( action ).to.eql( {
				type: SITES_UPDATE,
				sites
			} );
		} );
	} );

	describe( '#requestSites()', () => {
		const action = requestSites();
		expect( action ).to.eql( {
			type: SITES_REQUEST,
		} );
	} );

	describe( '#requestSite()', () => {
		const action = requestSite( 232323232 );
		expect( action ).to.eql( {
			type: SITE_REQUEST,
			siteId: 232323232,
		} );
	} );

	describe( '#deleteSite()', () => {
		const action = deleteSite( 3433434322 );
		expect( action ).to.eql( {
			type: SITE_DELETE,
			siteId: 3433434322,
		} );
	} );
} );
