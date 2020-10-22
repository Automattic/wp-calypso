/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';

describe( 'getSiteConnectionStatus()', () => {
	const siteId = 2916284;

	test( 'should return connection status for a known site', () => {
		const state = {
			sites: {
				connection: {
					items: {
						[ siteId ]: true,
					},
				},
			},
		};
		const output = getSiteConnectionStatus( state, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return null for an unknown site', () => {
		const state = {
			sites: {
				connection: {
					items: {
						77203074: true,
					},
				},
			},
		};
		const output = getSiteConnectionStatus( state, siteId );
		expect( output ).to.be.null;
	} );
} );
