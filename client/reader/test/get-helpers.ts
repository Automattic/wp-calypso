import { getSiteUrl, getSiteName, getPostIcon, getReaderSidebarSiteName } from '../get-helpers';

describe( 'getSiteUrl', () => {
	const siteWithUrl = { URL: 'siteWithUrl.com' };
	const feedWithUrl = { URL: 'feedWithUrl.com' };
	const feedWithFeedUrl = { feed_URL: 'feedwithFeedUrl.com' };
	const postWithSiteUrl = { site_URL: 'postWithSiteUrl' };

	test( 'should favor site over feed if both exist', () => {
		const siteUrl = getSiteUrl( { site: siteWithUrl, feed: feedWithUrl } );
		expect( siteUrl ).toEqual( siteWithUrl.URL );
	} );

	test( 'should get title from site if feed does not exist', () => {
		const siteUrl = getSiteUrl( { site: siteWithUrl } );
		expect( siteUrl ).toEqual( siteWithUrl.URL );
	} );

	test( 'should get title from feed if site does not exist', () => {
		const siteUrl = getSiteUrl( { feed: feedWithUrl } );
		expect( siteUrl ).toEqual( feedWithUrl.URL );

		const siteUrl2 = getSiteUrl( { feed: feedWithFeedUrl } );
		expect( siteUrl2 ).toEqual( 'feedwithFeedUrl.com' );
	} );

	test( 'should grab url from post if its there', () => {
		const siteUrl = getSiteUrl( { post: postWithSiteUrl } );
		expect( siteUrl ).toEqual( postWithSiteUrl.site_URL );
	} );

	test( 'should return undefined if cannot find a reasonable url', () => {
		const noArg = getSiteUrl();
		expect( noArg ).toEqual( undefined );

		const emptyArg = getSiteUrl( {} );
		expect( emptyArg ).toEqual( undefined );

		const emptySiteAndFeed = getSiteUrl( { feed: {}, site: {} } );
		expect( emptySiteAndFeed ).toEqual( undefined );
	} );
} );

describe( 'getPostIcon', () => {
	test.each( [
		[
			'returns site_icon.img if site_icon is an object',
			{
				site_icon: { img: 'https://example.com/icon.png' },
				author: { avatar_URL: 'https://example.com/avatar.png' },
			},
			'https://example.com/icon.png',
		],
		[
			'returns site_icon if it is a string',
			{
				site_icon: 'https://example.com/icon2.png',
				author: { avatar_URL: 'https://example.com/avatar.png' },
			},
			'https://example.com/icon2.png',
		],
		[
			'returns author.avatar_URL if site_icon is undefined',
			{ author: { avatar_URL: 'https://example.com/avatar.png' } },
			'https://example.com/avatar.png',
		],
		[ 'returns undefined if site_icon and author.avatar_URL are missing', {}, undefined ],
	] )( '%s', ( testCase, args, expected ): void => {
		expect( getPostIcon( args ) ).toEqual( expected );
	} );
} );

describe( 'getSiteName', () => {
	const siteWithDomain = { domain: 'siteDomain.com' };
	const siteWithTitleAndDomain = {
		title: 'siteWithTitleAndDomainTitle',
		domain: 'siteWithTitleAndDomainDomain',
	};
	const feedWithName = { name: 'feedName' };
	const feedWithTitle = { title: 'feedTitle' };
	const feedWithTitleAndName = { ...feedWithTitle, ...feedWithName };
	const feedWithError = { is_error: true };
	const feedWithUrl = { URL: 'http://feedWithUrl.com' };
	const allFeeds = [ feedWithName, feedWithTitle, feedWithTitleAndName, feedWithError ];
	const postWithSiteName = { site_name: 'postSiteName' };

	test( 'should favor site title over everything', () => {
		allFeeds.forEach( ( feed ) => {
			const siteName = getSiteName( { site: siteWithTitleAndDomain, feed } );
			expect( siteName ).toEqual( siteWithTitleAndDomain.title );
		} );
	} );

	test( 'should fallback to feed if site title doesnt exist', () => {
		const siteName = getSiteName( { site: {}, feed: feedWithName } );
		expect( siteName ).toEqual( feedWithName.name );

		const siteTitle = getSiteName( { site: {}, feed: feedWithTitle, post: {} } );
		expect( siteTitle ).toEqual( feedWithTitle.title );
	} );

	test( 'should fallback to post if neither site or feed exist', () => {
		expect( getSiteName( { site: {}, feed: {}, post: postWithSiteName } ) ).toEqual(
			postWithSiteName.site_name
		);

		expect( getSiteName( { post: postWithSiteName } ) ).toEqual( postWithSiteName.site_name );
	} );

	test( 'should fallback to domain name if cannot find title', () => {
		expect( getSiteName( { site: siteWithDomain, post: {} } ) ).toEqual( siteWithDomain.domain );

		expect( getSiteName( { feed: feedWithUrl } ) ).toEqual( 'feedwithurl.com' );
	} );

	test( 'should return null if nothing was found', () => {
		expect( getSiteName() ).toBeNull();

		expect( getSiteName( { feed: {}, site: {}, post: {} } ) ).toBeNull();
	} );
} );

// Untitled sites come back from the API URL-shaped with a trailing slash,
// e.g. "example.wordpress.com/".
describe( 'getReaderSidebarSiteName', () => {
	test( 'shows the mapped custom domain when the name is the free subdomain (with trailing slash)', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'exampleblog.wordpress.com/',
				URL: 'https://example.com',
			} )
		).toBe( 'example.com' );
	} );

	test( 'handles a name with protocol and trailing slash', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'https://exampleblog.wordpress.com/',
				URL: 'https://example.org',
			} )
		).toBe( 'example.org' );
	} );

	test( 'shows the mapped custom domain when the site has no name at all', () => {
		expect( getReaderSidebarSiteName( { name: '', URL: 'https://example.net' } ) ).toBe(
			'example.net'
		);
	} );

	test( 'keeps a real site title untouched', () => {
		expect(
			getReaderSidebarSiteName( { name: 'Example Site Title', URL: 'https://example.com' } )
		).toBe( 'Example Site Title' );
	} );

	test( 'shows the clean subdomain (no trailing slash) when the site has no custom domain', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'exampleblog.wordpress.com/',
				URL: 'https://exampleblog.wordpress.com',
			} )
		).toBe( 'exampleblog.wordpress.com' );
	} );

	test( 'falls back to the raw name when there is no URL to derive a domain from', () => {
		expect( getReaderSidebarSiteName( { name: 'Example Site Title', URL: '' } ) ).toBe(
			'Example Site Title'
		);
	} );

	test( 'derives an r/subreddit label from the URL for an unresolved subreddit', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://www.reddit.com/r/simracing/.rss',
			} )
		).toBe( 'r/simracing' );
	} );

	test( 'derives a u/user label from a Reddit user URL', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://www.reddit.com/user/spez/.rss',
			} )
		).toBe( 'u/spez' );
	} );

	test( 'prefers the r/subreddit handle over the generic reddit.com domain when the title is missing', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://www.reddit.com/r/simracing/',
			} )
		).toBe( 'r/simracing' );
	} );

	test( 'keeps the resolved title for a subreddit once it has one', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'SimRacing',
				URL: 'https://www.reddit.com/r/simracing/',
			} )
		).toBe( 'SimRacing' );
	} );

	test( 'does not treat a reddit.com look-alike host as Reddit', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://fakereddit.com/r/simracing/',
			} )
		).toBe( 'fakereddit.com' );
	} );
} );
