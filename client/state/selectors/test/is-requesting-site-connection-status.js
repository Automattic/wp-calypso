/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isRequestingSiteConnectionStatus from 'calypso/state/selectors/is-requesting-site-connection-status';

describe( 'isRequestingSiteConnectionStatus()', () => {
	const siteId = 2916284;

	test( 'should return true if connection status is currently being requested for that site', () => {
		const state = {
			sites: {
				connection: {
					requesting: {
						[ siteId ]: true,
					},
				},
			},
		};
		const output = isRequestingSiteConnectionStatus( state, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return false if connection status is currently not being requested for that site', () => {
		const state = {
			sites: {
				connection: {
					requesting: {
						[ siteId ]: false,
					},
				},
			},
		};
		const output = isRequestingSiteConnectionStatus( state, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return false if connection status has never been requested for that site', () => {
		const state = {
			sites: {
				connection: {
					requesting: {
						77203074: true,
					},
				},
			},
		};
		const output = isRequestingSiteConnectionStatus( state, siteId );
		expect( output ).to.be.false;
	} );
} );
