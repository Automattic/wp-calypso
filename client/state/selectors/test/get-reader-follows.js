/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import { userState } from './fixtures/user-state';

describe( 'getReaderFollows()', () => {
	const siteOne = {
		ID: 1,
	};
	const siteTwo = {
		ID: 2,
	};
	const feedOne = {
		feed_ID: 1,
	};
	const feedTwo = {
		feed_ID: 2,
	};
	const state = deepFreeze( {
		...userState,
		reader: {
			follows: {
				items: {
					'discovererror.wordpress.com': {
						URL: 'http://discovererror.wordpress.com',
						error: 'invalid_feed',
					},
					'discover.wordpress.com': {
						URL: 'http://discover.wordpress.com',
						blog_ID: 1,
					},
					'example.com': {
						URL: 'http://example.com',
						feed_ID: 1,
					},
					'fancy.example.com': {
						URL: 'http://fancy.example.com',
						blog_ID: 2,
						feed_ID: 2,
					},
				},
			},
			sites: {
				items: {
					1: siteOne,
					2: siteTwo,
				},
			},
			feeds: {
				items: {
					1: feedOne,
					2: feedTwo,
				},
			},
		},
	} );

	test( 'should not return follows with an error set and should fill in feed and site when available', () => {
		const follows = getReaderFollows( state );
		expect( follows ).to.eql( [
			{
				URL: 'http://discover.wordpress.com',
				blog_ID: 1,
				site: siteOne,
				feed: undefined,
			},
			{
				URL: 'http://example.com',
				feed_ID: 1,
				feed: feedOne,
				site: undefined,
			},
			{
				URL: 'http://fancy.example.com',
				blog_ID: 2,
				site: siteTwo,
				feed_ID: 2,
				feed: feedTwo,
			},
		] );
	} );
} );
