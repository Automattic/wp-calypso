/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getReaderAliasedFollowFeedUrl } from 'calypso/state/reader/follows/selectors';

const site1UrlKey = 'discover.wordpress.com';
const site1Aliases = [ 'site1 alias!', 'site1 second alias!' ];

const siteA = 'sitea/feed';
const siteB = 'siteb/rss';
const siteC = 'sitec/rss.xml';
const siteD = 'sited/feed/atom';

describe( 'getReaderAliasedFollowFeedUrl()', () => {
	const state = {
		reader: {
			follows: {
				items: {
					[ site1UrlKey ]: {
						feed_URL: site1UrlKey,
						alias_feed_URLs: site1Aliases,
					},
					[ siteA ]: { feed_URL: siteA },
					[ siteB ]: { feed_URL: siteB },
					[ siteC ]: { feed_URL: siteC },
					[ siteD ]: { feed_URL: siteD },
				},
			},
		},
	};

	test( 'should return passed in url if it cannot find anything', () => {
		const feedUrl = getReaderAliasedFollowFeedUrl( state, 'http://croissant.happy' );
		expect( feedUrl ).eql( 'http://croissant.happy' );
	} );

	test( 'should return exact match when it exists in state', () => {
		const feedUrl = getReaderAliasedFollowFeedUrl( state, site1UrlKey );
		expect( feedUrl ).eql( site1UrlKey );
	} );

	test( 'should utilize aliases within follow object to figure out a feed_url', () => {
		const feedUrl1 = getReaderAliasedFollowFeedUrl( state, site1Aliases[ 0 ] );
		expect( feedUrl1 ).eql( site1UrlKey );

		const feedUrl2 = getReaderAliasedFollowFeedUrl( state, site1Aliases[ 1 ] );
		expect( feedUrl2 ).eql( site1UrlKey );
	} );

	test( 'should try to guess basic rss/feed extensions', () => {
		const feedUrlA = getReaderAliasedFollowFeedUrl( state, 'siteA' );
		const feedUrlB = getReaderAliasedFollowFeedUrl( state, 'siteB' );
		const feedUrlC = getReaderAliasedFollowFeedUrl( state, 'siteC' );
		const feedUrlD = getReaderAliasedFollowFeedUrl( state, 'siteD' );

		expect( feedUrlA ).eql( siteA );
		expect( feedUrlB ).eql( siteB );
		expect( feedUrlC ).eql( siteC );
		expect( feedUrlD ).eql( siteD );
	} );
} );
