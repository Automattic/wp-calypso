/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */

import { getPublicizeSiteUserActiveConnections } from '../selectors';

describe( '#getSiteUserActiveConnections()', () => {
	it( 'should return an array with only active connetions', () => {
		const activeConnections = getPublicizeSiteUserActiveConnections( {
			sharing: {
				publicize: {
					connections: {
						1: { ID: 1, site_ID: 2916284, keyring_connection_user_ID: 26957695, status: 'broken' },
						2: { ID: 2, site_ID: 2916284, shared: true, status: 'ok' },
						3: { ID: 3, site_ID: 2916284, keyring_connection_user_ID: 26957695, status: 'ok' },
						4: { ID: 4, site_ID: 2916284, shared: true, status: 'broken' },
					}
				}
			}
		}, 2916284, 26957695 );

		expect( activeConnections ).to.eql( [
			{ ID: 2, site_ID: 2916284, shared: true, status: 'ok' },
			{ ID: 3, site_ID: 2916284, keyring_connection_user_ID: 26957695, status: 'ok' }
		] );
	} );
} );
