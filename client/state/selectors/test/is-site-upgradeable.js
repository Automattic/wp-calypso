/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isSiteUpgradeable from 'calypso/state/selectors/is-site-upgradeable';

describe( 'isSiteUpgradeable()', () => {
	test( 'should return null if no siteId is given', () => {
		const isUpgradeable = isSiteUpgradeable(
			{
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							options: {
								unmapped_url: 'https://example.wordpress.com',
							},
						},
					},
				},
				currentUser: {
					id: 123456,
				},
			},
			null
		);

		expect( isUpgradeable ).to.be.null;
	} );

	test( 'should return null if there is no site with that siteId', () => {
		const isUpgradeable = isSiteUpgradeable(
			{
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							options: {
								unmapped_url: 'https://example.wordpress.com',
							},
						},
					},
				},
				currentUser: {},
			},
			42
		);

		expect( isUpgradeable ).to.be.null;
	} );

	test( 'should return null if there is no current user', () => {
		const isUpgradeable = isSiteUpgradeable(
			{
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							options: {
								unmapped_url: 'https://example.wordpress.com',
							},
						},
					},
				},
				currentUser: {},
			},
			77203199
		);

		expect( isUpgradeable ).to.be.null;
	} );

	test( 'should return false if the user cannot manage the site ', () => {
		const isUpgradeable = isSiteUpgradeable(
			{
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							options: {
								unmapped_url: 'https://example.wordpress.com',
							},
						},
					},
				},
				currentUser: {
					id: 123456,
					capabilities: {
						77203199: {
							manage_options: false,
						},
					},
				},
			},
			77203199
		);

		expect( isUpgradeable ).to.be.false;
	} );

	test( 'should return true if the user can manage the site ', () => {
		const isUpgradeable = isSiteUpgradeable(
			{
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							options: {
								unmapped_url: 'https://example.wordpress.com',
							},
						},
					},
				},
				currentUser: {
					id: 123456,
					capabilities: {
						77203199: {
							manage_options: true,
						},
					},
				},
			},
			77203199
		);

		expect( isUpgradeable ).to.be.true;
	} );
} );
