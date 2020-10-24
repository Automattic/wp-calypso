/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSiteIconUrl from 'calypso/state/selectors/get-site-icon-url';
import MediaQueryManager from 'calypso/lib/query-manager/media';

describe( 'getSiteIconUrl()', () => {
	test( 'should return null if neither the site nor site settings are known', () => {
		const iconUrl = getSiteIconUrl(
			{
				sites: {
					items: {},
				},
				siteSettings: {
					items: {},
				},
				media: {
					queries: {},
				},
			},
			2916284
		);

		expect( iconUrl ).to.be.null;
	} );

	test( 'should the site icon image as a fallback if the media is not known for the assigned icon ID', () => {
		const iconUrl = getSiteIconUrl(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'WordPress.com Example Blog',
							icon: {
								img: 'https://secure.gravatar.com/blavatar/0d6c430459af115394a012d20b6711d6',
								ico: 'https://secure.gravatar.com/blavatar/0d6c430459af115394a012d20b6711d6',
							},
						},
					},
				},
				media: {
					queries: {},
				},
			},
			2916284
		);

		expect( iconUrl ).to.equal(
			'https://secure.gravatar.com/blavatar/0d6c430459af115394a012d20b6711d6'
		);
	} );

	test( 'should return the media URL via the site icon media ID', () => {
		const iconUrl = getSiteIconUrl(
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
				media: {
					queries: {
						2916284: new MediaQueryManager( {
							items: {
								42: {
									ID: 42,
									title: 'flowers',
									URL: 'https://example.files.wordpress.com/2014/06/flower.gif',
								},
							},
						} ),
					},
				},
			},
			2916284
		);

		expect( iconUrl ).to.equal( 'https://example.files.wordpress.com/2014/06/flower.gif' );
	} );
} );
