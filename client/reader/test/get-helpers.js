import { getSiteUrl, getSiteName } from '../get-helpers';

describe( '#getSiteUrl', () => {
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
		expect( noArg ).not.ok;

		const emptyArg = getSiteUrl( {} );
		expect( emptyArg ).not.ok;

		const emptySiteAndFeed = getSiteUrl( { feed: {}, site: {} } );
		expect( emptySiteAndFeed ).not.ok;
	} );
} );

describe( '#getSiteName', () => {
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
