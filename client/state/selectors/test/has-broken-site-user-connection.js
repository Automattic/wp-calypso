/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import hasBrokenSiteUserConnection from 'calypso/state/selectors/has-broken-site-user-connection';

describe( 'hasBrokenSiteUserConnection()', () => {
	test( 'should return false if no connections for site', () => {
		const hasBroken = hasBrokenSiteUserConnection(
			{
				sharing: {
					publicize: {
						connections: {},
					},
				},
			},
			2916284,
			26957695
		);

		expect( hasBroken ).to.be.false;
	} );

	test( 'should return false if all connections ok', () => {
		const hasBroken = hasBrokenSiteUserConnection(
			{
				sharing: {
					publicize: {
						connections: {
							1: { ID: 1, site_ID: 2916284, shared: true, status: 'ok' },
							2: { ID: 2, site_ID: 2916284, keyring_connection_user_ID: 26957695, status: 'ok' },
						},
					},
				},
			},
			2916284,
			26957695
		);

		expect( hasBroken ).to.be.false;
	} );

	test( 'should return true if any connections broken', () => {
		const hasBroken = hasBrokenSiteUserConnection(
			{
				sharing: {
					publicize: {
						connections: {
							1: { ID: 1, site_ID: 2916284, shared: true, status: 'ok' },
							2: {
								ID: 2,
								site_ID: 2916284,
								keyring_connection_user_ID: 26957695,
								status: 'broken',
							},
						},
					},
				},
			},
			2916284,
			26957695
		);

		expect( hasBroken ).to.be.true;
	} );
} );
