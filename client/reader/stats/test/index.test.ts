/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { when } from 'jest-when';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat, bumpStatWithPageView } from 'calypso/lib/analytics/mc';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { type TrackPostData } from 'calypso/state/reader/analytics/types';
import {
	recordGaEvent,
	recordPermalinkClick,
	buildReaderTracksEventProps,
	recordTrack,
	recordTracksRailcar,
	recordTracksRailcarRender,
	recordTracksRailcarInteract,
	recordTrackForPost,
	getTracksPropertiesForPost,
	recordTrackWithRailcar,
	pageViewForPost,
	recordFollow,
	recordUnfollow,
	getLocation,
} from '../index';

// Mock dependencies
jest.mock( 'debug', () => () => jest.fn() );
jest.mock( 'calypso/lib/analytics/ga', () => ( {
	gaRecordEvent: jest.fn(),
} ) );
jest.mock( 'calypso/lib/analytics/mc', () => ( {
	bumpStat: jest.fn(),
	bumpStatWithPageView: jest.fn(),
} ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( '@automattic/i18n-utils', () => ( {
	localeRegexString: 'en|es|fr|de|it|pt|ru|ja|ko|zh',
	...jest.requireActual( '@automattic/i18n-utils' ),
} ) );
jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

describe( 'reader stats', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		// Mock window.location
		Object.defineProperty( window, 'location', {
			value: {
				pathname: '/reader',
				search: '',
			},
			writable: true,
		} );
	} );

	describe( 'recordGaEvent', () => {
		it( 'should record a GA event with all parameters', () => {
			recordGaEvent( 'test_action', 'test_label', '123' );

			expect( gaRecordEvent ).toHaveBeenCalledWith( 'Reader', 'test_action', 'test_label', '123' );
		} );

		it( 'should record a GA event with minimal parameters', () => {
			recordGaEvent( 'test_action' );

			expect( gaRecordEvent ).toHaveBeenCalledWith( 'Reader', 'test_action', undefined, undefined );
		} );
	} );

	describe( 'recordPermalinkClick', () => {
		it( 'should record permalink click with post', () => {
			const post = { ID: 123, site_ID: 456 } as unknown as TrackPostData;
			const eventProperties = { extra: 'data' };

			recordPermalinkClick( 'test_source', post, eventProperties );

			expect( bumpStat ).toHaveBeenCalledWith( {
				reader_actions: 'visited_post_permalink',
				reader_permalink_source: 'test_source',
			} );
			expect( gaRecordEvent ).toHaveBeenCalledWith(
				'Reader',
				'Clicked Post Permalink',
				'test_source',
				undefined
			);
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_permalink_click',
				expect.objectContaining( {
					source: 'test_source',
					extra: 'data',
					blog_id: 456,
					post_id: 123,
				} )
			);
		} );

		it( 'should record permalink click without post', () => {
			const eventProperties = { extra: 'data' };

			recordPermalinkClick( 'test_source', undefined, eventProperties );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_permalink_click',
				expect.objectContaining( {
					source: 'test_source',
					extra: 'data',
				} )
			);
		} );
	} );

	describe( 'buildReaderTracksEventProps', () => {
		it( 'should build event properties with location', () => {
			const result = buildReaderTracksEventProps( { custom: 'prop' } );

			expect( result ).toEqual( {
				ui_algo: 'following',
				custom: 'prop',
			} );
		} );

		it( 'should build event properties with pathname override', () => {
			const result = buildReaderTracksEventProps( { custom: 'prop' }, '/discover' );

			expect( result ).toEqual( {
				ui_algo: 'discover_recommended',
				custom: 'prop',
			} );
		} );

		it( 'should build event properties with post', () => {
			const post = { ID: 123, site_ID: 456, is_jetpack: true } as unknown as TrackPostData;
			const result = buildReaderTracksEventProps( { custom: 'prop' }, undefined, post );

			expect( result ).toEqual( {
				ui_algo: 'following',
				custom: 'prop',
				blog_id: 456,
				post_id: 123,
				is_jetpack: true,
			} );
		} );
	} );

	describe( 'recordTrack', () => {
		it( 'should record track event', () => {
			recordTrack( 'test_event', { prop: 'value' } );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'test_event',
				expect.objectContaining( {
					ui_algo: 'following',
					prop: 'value',
				} )
			);
		} );

		it( 'should record track event with pathname override', () => {
			recordTrack( 'test_event', { prop: 'value' }, { pathnameOverride: '/discover' } );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'test_event',
				expect.objectContaining( {
					ui_algo: 'discover_recommended',
					prop: 'value',
				} )
			);
		} );
	} );

	describe( 'recordTracksRailcar', () => {
		it( 'should record tracks railcar event', () => {
			const railcar = {
				railcar: 'test_railcar',
				fetch_algo: 'test_algo',
				fetch_lang: 'en',
				fetch_position: 1,
				rec_blog_id: '123',
			};
			const overrides = { override: 'value' };

			recordTracksRailcar( 'test_action', 'calypso_reader_test_event', railcar, overrides );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'test_action',
				expect.objectContaining( {
					action: 'test_event',
					railcar: 'test_railcar',
					override: 'value',
				} )
			);
		} );

		it( 'should record tracks railcar event without event name', () => {
			const railcar = {
				railcar: 'test_railcar',
				fetch_algo: 'test_algo',
				fetch_lang: 'en',
				fetch_position: 1,
				rec_blog_id: '123',
			};

			recordTracksRailcar( 'test_action', null, railcar );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'test_action',
				expect.objectContaining( {
					railcar: 'test_railcar',
				} )
			);
		} );
	} );

	describe( 'recordTracksRailcarRender', () => {
		it( 'should record tracks railcar render event', () => {
			const railcar = {
				railcar: 'test_railcar',
				fetch_algo: 'test_algo',
				fetch_lang: 'en',
				fetch_position: 1,
				rec_blog_id: '123',
			};
			const overrides = { override: 'value' };

			recordTracksRailcarRender( 'calypso_reader_test_event', railcar, overrides );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_traintracks_render',
				expect.objectContaining( {
					action: 'test_event',
					railcar: 'test_railcar',
					override: 'value',
				} )
			);
		} );
	} );

	describe( 'recordTracksRailcarInteract', () => {
		it( 'should record tracks railcar interact event', () => {
			const railcar = {
				railcar: 'test_railcar',
				fetch_algo: 'test_algo',
				fetch_lang: 'en',
				fetch_position: 1,
				rec_blog_id: '123',
			};
			const overrides = { override: 'value' };

			recordTracksRailcarInteract( 'calypso_reader_test_event', railcar, overrides );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_traintracks_interact',
				expect.objectContaining( {
					action: 'test_event',
					railcar: 'test_railcar',
					override: 'value',
				} )
			);
		} );
	} );

	describe( 'recordTrackForPost', () => {
		it( 'should record track for post with railcar', () => {
			const post = {
				ID: 123,
				site_ID: 456,
				is_jetpack: true,
				railcar: {
					railcar: 'test_railcar',
					fetch_algo: 'test_algo',
					fetch_lang: 'en',
					fetch_position: 1,
					rec_blog_id: '123',
				},
			} as unknown as TrackPostData;
			const additionalProps = { ui_position: 1, ui_algo: 'test' };

			recordTrackForPost( 'calypso_reader_article_opened', post, additionalProps );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_article_opened',
				expect.objectContaining( {
					blog_id: 456,
					post_id: 123,
					is_jetpack: true,
					ui_position: 1,
					ui_algo: 'test',
				} )
			);
		} );

		it( 'should track calypso_traintracks_interact when the post has a railcar', () => {
			const post = {
				ID: 123,
				site_ID: 456,
				railcar: {
					railcar: 'test_railcar',
					fetch_algo: 'test_algo',
					fetch_lang: 'en',
					fetch_position: 1,
					rec_blog_id: '123',
				},
			} as unknown as TrackPostData;

			recordTrackForPost( 'calypso_reader_article_opened', post );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_traintracks_interact',
				expect.objectContaining( {
					railcar: 'test_railcar',
					action: 'article_opened',
					fetch_algo: 'test_algo',
					fetch_lang: 'en',
					fetch_position: 1,
					rec_blog_id: '123',
				} )
			);
		} );

		it( 'should record track for post without railcar', () => {
			const post = { ID: 123, site_ID: 456 } as unknown as TrackPostData;

			recordTrackForPost( 'calypso_reader_article_opened', post );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_article_opened',
				expect.objectContaining( {
					blog_id: 456,
					post_id: 123,
				} )
			);
		} );
	} );

	describe( 'getTracksPropertiesForPost', () => {
		it( 'should return properties for valid post', () => {
			const post = {
				ID: 123,
				site_ID: 456,
				feed_ID: 789,
				feed_item_ID: 101,
				is_jetpack: true,
				is_external: false,
			} as unknown as TrackPostData;

			const result = getTracksPropertiesForPost( post );

			expect( result ).toEqual( {
				blog_id: 456,
				post_id: 123,
				feed_id: 789,
				feed_item_id: 101,
				is_jetpack: true,
			} );
		} );

		it( 'should return railcar properties for post with railcar', () => {
			const post = {
				ID: 123,
				site_ID: 456,
				railcar: {
					railcar: 'test_railcar',
					fetch_algo: 'test_algo',
					fetch_lang: 'en',
					fetch_position: 1,
					rec_blog_id: '123',
				},
			} as unknown as TrackPostData;

			expect( getTracksPropertiesForPost( post ) ).toMatchObject( {
				railcar: 'test_railcar',
				fetch_algo: 'test_algo',
				fetch_lang: 'en',
				fetch_position: 1,
			} );
		} );

		it( 'should return properties for post with zero IDs', () => {
			const post = {
				ID: 0,
				site_ID: 0,
				feed_ID: 0,
				feed_item_ID: 0,
			} as unknown as TrackPostData;

			const result = getTracksPropertiesForPost( post );

			expect( result ).toEqual( {
				blog_id: undefined,
				post_id: undefined,
				feed_id: undefined,
				feed_item_id: undefined,
				is_jetpack: undefined,
			} );
		} );
	} );

	describe( 'recordTrackWithRailcar', () => {
		it( 'should record track with railcar', () => {
			const railcar = {
				railcar: 'test_railcar',
				fetch_algo: 'test_algo',
				fetch_lang: 'en',
				fetch_position: 1,
				rec_blog_id: '123',
			};
			const eventProperties = { ui_position: 1, ui_algo: 'test', other: 'prop' };

			recordTrackWithRailcar( 'test_event', railcar, eventProperties );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'test_event',
				expect.objectContaining( {
					ui_position: 1,
					ui_algo: 'test',
					other: 'prop',
				} )
			);
		} );
	} );

	describe( 'pageViewForPost', () => {
		it( 'should record page view for post', () => {
			pageViewForPost( 123, 'https://example.com', 456, false );

			expect( bumpStatWithPageView ).toHaveBeenCalledWith( {
				ref: 'http://wordpress.com/',
				reader: 1,
				host: 'example.com',
				blog: 123,
				post: 456,
			} );
		} );

		it( 'should record page view for private post', () => {
			pageViewForPost( 123, 'https://example.com', 456, true );

			expect( bumpStatWithPageView ).toHaveBeenCalledWith( {
				ref: 'http://wordpress.com/',
				reader: 1,
				host: 'example.com',
				blog: 123,
				post: 456,
				priv: 1,
			} );
		} );

		it( 'should not record page view with missing blogId', () => {
			pageViewForPost( 0, 'https://example.com', 456, false );

			expect( bumpStatWithPageView ).not.toHaveBeenCalled();
		} );

		it( 'should not record page view with missing blogUrl', () => {
			pageViewForPost( 123, '', 456, false );

			expect( bumpStatWithPageView ).not.toHaveBeenCalled();
		} );

		it( 'should not record page view with missing postId', () => {
			pageViewForPost( 123, 'https://example.com', 0, false );

			expect( bumpStatWithPageView ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'recordFollow', () => {
		beforeEach( () => {
			// Mock window.location for follow/unfollow tests
			Object.defineProperty( window, 'location', {
				value: {
					pathname: '/reader',
					search: '',
				},
				writable: true,
			} );
		} );

		it( 'should record follow with railcar', () => {
			const railcar = {
				railcar: 'test_railcar',
				fetch_algo: 'test_algo',
				fetch_lang: 'en',
				fetch_position: 1,
				rec_blog_id: '123',
			};
			const additionalProps = { follow_source: 'test_source' };

			recordFollow( 'https://example.com', railcar, additionalProps );

			expect( bumpStat ).toHaveBeenCalledWith( 'reader_follows', 'test_source' );
			expect( bumpStat ).toHaveBeenCalledWith( 'reader_actions', 'followed_blog' );
			expect( gaRecordEvent ).toHaveBeenCalledWith(
				'Reader',
				'Clicked Follow Blog',
				'test_source',
				undefined
			);
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_site_followed',
				expect.objectContaining( {
					url: 'https://example.com',
					source: 'test_source',
				} )
			);
		} );

		it( 'should record follow without railcar', () => {
			recordFollow( 'https://example.com' );

			expect( bumpStat ).toHaveBeenCalledWith( 'reader_follows', 'following' );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_site_followed',
				expect.objectContaining( {
					url: 'https://example.com',
					source: 'following',
				} )
			);
		} );
	} );

	describe( 'recordUnfollow', () => {
		beforeEach( () => {
			// Mock window.location for follow/unfollow tests
			Object.defineProperty( window, 'location', {
				value: {
					pathname: '/reader',
					search: '',
				},
				writable: true,
			} );
		} );

		it( 'should record unfollow with railcar', () => {
			const railcar = {
				railcar: 'test_railcar',
				fetch_algo: 'test_algo',
				fetch_lang: 'en',
				fetch_position: 1,
				rec_blog_id: '123',
			};
			const additionalProps = { follow_source: 'test_source' };

			recordUnfollow( 'https://example.com', railcar, additionalProps );

			expect( bumpStat ).toHaveBeenCalledWith( 'reader_unfollows', 'test_source' );
			expect( bumpStat ).toHaveBeenCalledWith( 'reader_actions', 'unfollowed_blog' );
			expect( gaRecordEvent ).toHaveBeenCalledWith(
				'Reader',
				'Clicked Unfollow Blog',
				'test_source',
				undefined
			);
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_site_unfollowed',
				expect.objectContaining( {
					url: 'https://example.com',
					source: 'test_source',
				} )
			);
		} );

		it( 'should record unfollow without railcar', () => {
			recordUnfollow( 'https://example.com' );

			expect( bumpStat ).toHaveBeenCalledWith( 'reader_unfollows', 'following' );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_site_unfollowed',
				expect.objectContaining( {
					url: 'https://example.com',
					source: 'following',
				} )
			);
		} );
	} );

	describe( 'getLocation', () => {
		describe( 'base urls', () => {
			const scenarios = [
				{
					url: '/unknown-url',
					expected: 'unknown',
					description: 'unknown url',
				},
				{
					url: '/home',
					expected: 'home',
					description: 'home page',
				},
				{
					url: '',
					expected: 'unknown',
					description: 'empty url',
				},
			] as const;

			it.each( scenarios )( 'should return $expected for "$description" ($url)', ( scenario ) => {
				expect( getLocation( scenario.url ) ).toBe( scenario.expected );
			} );
		} );
		describe( 'reader urls', () => {
			const scenarios = [
				{
					url: '/reader',
					expected: 'following',
					description: 'reader page',
				},
				{
					url: '/reader/recent/',
					expected: 'following',
					description: 'reader recent page',
				},
				{
					url: '/reader/a8c',
					expected: 'following_a8c',
					description: 'reader a8c page',
				},
				{
					url: '/reader/p2',
					expected: 'following_p2',
					description: 'reader p2 page',
				},
				{
					url: '/reader/blogs/123',
					expected: 'blog_page',
					description: 'reader blog page',
				},
				{
					url: '/reader/feeds/123',
					expected: 'blog_page',
					description: 'reader feed page',
				},
				{
					url: '/reader/list/',
					expected: 'list',
					description: 'reader list page',
				},
				{
					url: '/reader/feeds/123/posts/123',
					expected: 'single_post',
					description: 'reader feed page with post',
				},
				{
					url: '/reader/search',
					expected: 'search',
					description: 'reader search page',
				},
				{
					url: '/reader/conversations',
					expected: 'conversations',
					description: 'reader conversations page',
				},
				{
					url: '/reader/conversations/a8c',
					expected: 'conversations_a8c',
					description: 'reader conversations a8c page',
				},
			] as const;

			scenarios.map( ( scenario ) => {
				it( `should return ${ scenario.expected } for ${ scenario.description } (${ scenario.url })`, () => {
					expect( getLocation( scenario.url ) ).toBe( scenario.expected );
				} );
			} );
		} );

		describe( 'discover urls', () => {
			const scenarios = [
				{
					url: '/discover',
					expected: 'discover_recommended',
					description: 'discover recommended page',
					searchParams: {},
				},
				{
					url: '/discover/add-new',
					expected: 'discover_addnew',
					description: 'discover add new page',
					searchParams: {},
				},
				{
					url: '/discover/firstposts',
					expected: 'discover_firstposts',
					description: 'discover first posts page',
					searchParams: {},
				},
				{
					url: '/discover/reddit',
					expected: 'discover_reddit',
					description: 'discover reddit page',
					searchParams: {},
				},
				{
					url: '/discover/latest',
					expected: 'discover_latest',
					description: 'discover latest page',
					searchParams: {},
				},
				{
					url: '/discover/tags/test',
					expected: 'discover_tag:test',
					description: 'discover tags page with tag',
					searchParams: { selectedTag: 'test' },
				},
				{
					url: '/discover/tags/test?sort=relevance',
					expected: 'discover_tag:test',
					description: 'discover tags page with tag and sort',
					searchParams: { selectedTag: 'test', sort: 'relevance' },
				},
				{
					url: '/discover/wrong-url',
					expected: 'discover_unknown',
					description: 'discover wrong url',
					searchParams: {},
				},
			] as const;

			it.each( scenarios )(
				'should return $expected for "$description" ($url with search params $searchParams)',
				( scenario ) => {
					expect( getLocation( addQueryArgs( scenario.url, scenario.searchParams ) ) ).toBe(
						scenario.expected
					);
				}
			);

			it( 'returns freshly-pressed when the feature flag is on and there is no subpath', () => {
				when( isEnabled ).calledWith( 'reader/discover/freshly-pressed' ).mockReturnValue( true );

				expect( getLocation( '/discover' ) ).toBe( 'freshly-pressed' );
			} );

			it( 'returns recommended when the feature flag is off and there is no subpath', () => {
				when( isEnabled ).calledWith( 'reader/discover/freshly-pressed' ).mockReturnValue( false );

				expect( getLocation( '/discover' ) ).toBe( 'discover_recommended' );
			} );

			it( 'supports the /discover/recommended subpath', () => {
				expect( getLocation( '/discover/recommended' ) ).toBe( 'discover_recommended' );
			} );
		} );

		describe( 'postlike urls', () => {
			const scenarios = [
				{
					url: '/activities/likes',
					expected: 'postlike',
					description: 'postlike page',
					searchParams: {},
				},
				{
					url: '/activities/likes?sort=relevance',
					expected: 'postlike',
					description: 'postlike page with sort',
					searchParams: { sort: 'relevance' },
				},
			] as const;

			it.each( scenarios )(
				'should return $expected for "$description" ($url with search params $searchParams)',
				( scenario ) => {
					expect( getLocation( addQueryArgs( scenario.url, scenario.searchParams ) ) ).toBe(
						scenario.expected
					);
				}
			);
		} );

		describe( 'topic page urls', () => {
			const scenarios = [
				{
					url: '/tag/test2',
					expected: 'topic_page:date',
					description: 'topic page with date as default sort',
					searchParams: {},
				},
				{
					url: '/tag/test?sort=relevance',
					expected: 'topic_page:relevance',
					description: 'topic page with sort',
					searchParams: { sort: 'relevance' },
				},
			] as const;

			it.each( scenarios )(
				'should return $expected for "$description" ($url with search params $searchParams)',
				( scenario ) => {
					expect( getLocation( addQueryArgs( scenario.url, scenario.searchParams ) ) ).toBe(
						scenario.expected
					);
				}
			);
		} );
	} );
} );
