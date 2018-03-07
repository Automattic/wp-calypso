/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getReaderAliasedFollowFeedUrl } from 'state/selectors';

const site1UrlKey = 'example.com';
const site1Aliases = [ 'www.example.com', 'www.example.com/discover/feed' ];

const siteA = 'example.com/a/feed';
const siteB = 'example.com/b/rss';
const siteC = 'example.com/c/rss.xml';
const siteD = 'example.com/d/feed/atom';

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
		const feedUrlA = getReaderAliasedFollowFeedUrl( state, 'example.com/a' );
		const feedUrlB = getReaderAliasedFollowFeedUrl( state, 'example.com/b' );
		const feedUrlC = getReaderAliasedFollowFeedUrl( state, 'example.com/c' );
		const feedUrlD = getReaderAliasedFollowFeedUrl( state, 'example.com/d' );

		expect( feedUrlA ).eql( siteA );
		expect( feedUrlB ).eql( siteB );
		expect( feedUrlC ).eql( siteC );
		expect( feedUrlD ).eql( siteD );
	} );
} );
