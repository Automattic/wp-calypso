import { Visibility } from '@automattic/data-stores';
import wpcom from 'calypso/lib/wp'; // eslint-disable-line no-restricted-imports
import { createSite, getNewSiteParams } from '..';
import { HOSTING_LP_FLOW } from '../../utils/flows';
import wpcomRequest from '../../wpcom-request';

jest.mock( 'calypso/lib/wp', () => ( { req: { post: jest.fn() } } ), { virtual: true } );
jest.mock( '../../wpcom-request', () => jest.fn() );
jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => `config:${ key }`;
	config.isEnabled = () => false;
	return { __esModule: true, default: config, isEnabled: config.isEnabled };
} );

// The account this flow just created is signed in by a bearer token the shared wpcom client
// carries. A bare proxy request has no token and is authenticated by a JWT bound to the browser's
// login cookie instead, which any login, logout or second signup in the browser invalidates. So
// site creation must go through the shared client, as the other site-creation paths do.
describe( 'createSite', () => {
	afterEach( () => jest.clearAllMocks() );

	test( 'posts /sites/new through the shared wpcom client, not the bare proxy', async () => {
		( wpcom.req.post as jest.Mock ).mockResolvedValue( {
			success: true,
			blog_details: { url: 'https://example.wordpress.com', blogid: 123 },
		} );

		const result = await createSite(
			'onboarding',
			'pub/twentytwentyfour',
			Visibility.Private,
			'Example',
			'#113AF5',
			false,
			'exampleuser',
			null,
			'example'
		);

		expect( wpcomRequest ).not.toHaveBeenCalled();
		expect( wpcom.req.post ).toHaveBeenCalledWith(
			{ path: '/sites/new', apiVersion: '1.1' },
			{},
			expect.objectContaining( {
				blog_name: 'example',
				client_id: 'config:wpcom_signup_id',
				client_secret: 'config:wpcom_signup_key',
			} )
		);
		expect( result ).toEqual( {
			siteId: 123,
			siteSlug: 'example.wordpress.com',
			domainItem: undefined,
		} );
	} );
} );

describe( 'getNewSiteParams', () => {
	function testParams( partialParams: Partial< Parameters< typeof getNewSiteParams >[ 0 ] > = {} ) {
		return {
			flowToCheck: 'test-flow',
			themeSlugWithRepo: 'pub/test-theme',
			siteTitle: 'test site title',
			siteAccentColor: '#deface',
			useThemeHeadstart: false,
			siteVisibility: Visibility.Private,
			username: 'testuser',
			...partialParams,
			partnerBundle: partialParams.partnerBundle ?? null,
		} satisfies Parameters< typeof getNewSiteParams >[ 0 ];
	}

	test( 'siteVisibility set to publicly indexed', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteVisibility: Visibility.PublicIndexed,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				public: Visibility.PublicIndexed,
				options: expect.objectContaining( {
					wpcom_public_coming_soon: 0,
				} ),
			} )
		);
	} );

	test( 'siteVisibility set to public but not indexed', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteVisibility: Visibility.PublicNotIndexed,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				public: Visibility.PublicNotIndexed,
				options: expect.objectContaining( {
					wpcom_public_coming_soon: 1,
				} ),
			} )
		);
	} );

	test( 'siteVisibility set to private', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteVisibility: Visibility.Private,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				public: Visibility.Private,
				options: expect.objectContaining( {
					wpcom_public_coming_soon: 0, // Private sites are not "private" from all traffic
				} ),
			} )
		);
	} );

	test( 'blog_name hint uses the site title when no site URL is present', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: undefined,
					siteTitle: 'Testing Inc.',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'Testing Inc.',
				find_available_url: true,
			} )
		);
	} );

	test( 'blog_name hint falls back to the username when no site URL or title is present', () => {
		expect(
			getNewSiteParams(
				testParams( {
					flowToCheck: HOSTING_LP_FLOW,
					siteUrl: undefined,
					siteTitle: '',
					username: 'janedoe',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: '',
				find_available_url: true,
			} )
		);
	} );

	test( 'Hosting flow does not fall back to username when site title and URL are missing', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: undefined,
					siteTitle: '',
					username: 'janedoe',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'janedoe',
				find_available_url: true,
			} )
		);
	} );

	test( 'blog_name hint uses the site URL when present', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: 'testing123.wordpress.com',
					siteTitle: 'Testing Inc.',
					username: 'janedoe',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'testing123',
				find_available_url: false,
			} )
		);
	} );

	test( 'find_available_url is true when siteUrl is a custom domain', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: 'example.com',
					siteTitle: 'Testing Inc.',
					username: 'janedoe',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'example.com',
				find_available_url: true,
			} )
		);
	} );

	test( 'find_available_url is false when siteUrl is a free .blog subdomain', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: 'mysite.tech.blog',
					siteTitle: 'Testing Inc.',
					username: 'janedoe',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'mysite.tech.blog',
				find_available_url: false,
			} )
		);
	} );
} );
