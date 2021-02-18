/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSiteIconId from 'calypso/state/selectors/get-site-icon-id';

describe( 'getSiteIconId()', () => {
	test( 'should return null if neither the site nor settings are known', () => {
		const id = getSiteIconId(
			{
				sites: {
					items: {},
				},
				siteSettings: {
					items: {},
				},
			},
			2916284
		);

		expect( id ).to.be.null;
	} );

	test( 'should prefer site state', () => {
		const id = getSiteIconId(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'WordPress.com Example Blog',
							icon: {
								media_id: 42,
							},
						},
					},
				},
				siteSettings: {
					items: {
						2916284: {
							site_icon: 36,
						},
					},
				},
			},
			2916284
		);

		expect( id ).to.equal( 42 );
	} );

	test( 'should prefer site state, even if unset', () => {
		const id = getSiteIconId(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'WordPress.com Example Blog',
						},
					},
				},
				siteSettings: {
					items: {
						2916284: {
							site_icon: 42,
						},
					},
				},
			},
			2916284
		);

		expect( id ).to.be.null;
	} );

	test( 'should fall back to settings state', () => {
		const id = getSiteIconId(
			{
				sites: {
					items: {},
				},
				siteSettings: {
					items: {
						2916284: {
							site_icon: 42,
						},
					},
				},
			},
			2916284
		);

		expect( id ).to.equal( 42 );
	} );
} );
