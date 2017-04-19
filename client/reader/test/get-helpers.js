/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { getSiteUrl, getSiteName } from '../get-helpers';

describe( '#getSiteUrl', () => {
	const siteWithUrl = { URL: 'siteWithUrl.com' };
	const feedWithUrl = { URL: 'feedWithUrl.com' };
	const feedWithFeedUrl = { feed_URL: 'feedwithFeedUrl.com' };
	const postWithSiteUrl = { site_URL: 'postWithSiteUrl' };
	const postWithFeedUrl = { feed_URL: 'postWithFeedUrl' };

	it( 'should favor site over feed if both exist', () => {
		const siteUrl = getSiteUrl( { site: siteWithUrl, feed: feedWithUrl } );
		expect( siteUrl ).eql( siteWithUrl.URL );
	} );

	it( 'should get title from site if feed does not exist', () => {
		const siteUrl = getSiteUrl( { site: siteWithUrl } );
		expect( siteUrl ).eql( siteWithUrl.URL );
	} );

	it( 'should get title from feed if site does not exist', () => {
		const siteUrl = getSiteUrl( { feed: feedWithUrl } );
		expect( siteUrl ).eql( feedWithUrl.URL );

		const siteUrl2 = getSiteUrl( { feed: feedWithFeedUrl } );
		expect( siteUrl2 ).eql( feedWithFeedUrl.feed_URL );
	} );

	it( 'should get title from site if feed does not exist', () => {
		const siteUrl = getSiteUrl( { site: siteWithUrl } );
		expect( siteUrl ).eql( siteWithUrl.URL );
	} );

	it( 'should grab url from post if its there', () => {
		const siteUrl = getSiteUrl( { post: postWithSiteUrl } );
		expect( siteUrl ).eql( postWithSiteUrl.site_URL );

		const feedUrl = getSiteUrl( { post: postWithFeedUrl } );
		expect( feedUrl ).eql( postWithFeedUrl.feed_URL );
	} );

	it( 'should return false if cannot find a reasonable url', () => {
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
		domain: 'siteWithTitleAndDomainDomain'
	};
	const feedWithName = { name: 'feedName' };
	const feedWithTitle = { title: 'feedTitle' };
	const feedWithTitleAndName = { ...feedWithTitle, ...feedWithName };
	const feedWithError = { is_error: true };
	const feedWithUrl = { URL: 'http://feedWithUrl.com' };
	const feedWithFeedUrl = { feed_URL: 'http://feedwithFeedUrl.com/hello' };
	const allFeeds = [ feedWithName, feedWithTitle, feedWithTitleAndName, feedWithError ];
	const postWithSiteName = { site_name: 'postSiteName' };

	it( 'should favor site title over everything', () => {
		allFeeds.forEach( feed => {
			const siteName = getSiteName( { site: siteWithTitleAndDomain, feed } );
			expect( siteName ).eql( siteWithTitleAndDomain.title );
		} );
	} );

	it( 'should fallback to feed if site title doesnt exist', () => {
		const siteName = getSiteName( { site: {}, feed: feedWithName } );
		expect( siteName ).eql( feedWithName.name );

		const siteTitle = getSiteName( { site: {}, feed: feedWithTitle, post: {} } );
		expect( siteTitle ).eql( feedWithTitle.title );
	} );

	it( 'should fallback to post if neither site or feed exist', () => {
		expect(
			getSiteName( { site: {}, feed: {}, post: postWithSiteName } )
		).eql( postWithSiteName.site_name );

		expect(
			getSiteName( { post: postWithSiteName } )
		).eql( postWithSiteName.site_name );
	} );

	it( 'should fallback to domain name if cannot find title', () => {
		expect(
			getSiteName( { site: siteWithDomain, post: {} } )
		).eql( siteWithDomain.domain );

		expect(
			getSiteName( { feed: feedWithFeedUrl } )
		).eql( 'feedwithfeedurl.com' );

		expect(
			getSiteName( { feed: feedWithUrl } )
		).eql( 'feedwithurl.com' );
	} );

	it( 'should return null if nothing was found', () => {
		expect( getSiteName() ).eql( null );

		expect(
			getSiteName( { feed: {}, site: {}, post: {} } )
		).eql( null );
	} );
} );
