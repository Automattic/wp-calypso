import deepFreeze from 'deep-freeze';
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import { userState } from './fixtures/user-state';

describe( 'getReaderFollows()', () => {
	const siteOne = {
		ID: 1,
	};
	const siteTwo = {
		ID: 2,
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
		},
	} );

	test( 'should not return follows with an error set and should fill in site when available', () => {
		const follows = getReaderFollows( state );
		expect( follows ).toEqual( [
			{
				URL: 'http://discover.wordpress.com',
				blog_ID: 1,
				site: siteOne,
			},
			{
				URL: 'http://example.com',
				feed_ID: 1,
				site: undefined,
			},
			{
				URL: 'http://fancy.example.com',
				blog_ID: 2,
				site: siteTwo,
				feed_ID: 2,
			},
		] );
	} );
} );
