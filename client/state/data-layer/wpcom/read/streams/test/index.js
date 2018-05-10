/** @format */
/**
 * External Dependencies
 */
import deepfreeze from 'deep-freeze';

/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestPage, handlePage, handleError, fromApi } from '../';
import { requestPage as requestPageAction, receivePage } from 'state/reader/streams/actions';
import { errorNotice } from 'state/notices/actions';

describe( 'streams', () => {
	const action = deepfreeze( requestPageAction( { streamKey: 'following', page: 2 } ) );

	describe( 'requestPage', () => {
		it( 'should return an http request', () => {
			expect( requestPage( action ) ).toEqual(
				http( {
					method: 'GET',
					path: '/read/following',
					apiVersion: '1.2',
					query: action.query,
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );

		describe( 'stream types', () => {
			// a bunch of test cases
			// each test is an assertion of the http call that should be made
			// when the given stream id is handed to request page
			[
				{
					stream: 'following',
					expected: {
						method: 'GET',
						path: '/read/following',
						apiVersion: '1.2',
						query: {},
					},
				},
				{
					stream: 'a8c',
					expected: {
						method: 'GET',
						path: '/read/a8c',
						apiVersion: '1.2',
						query: {},
					},
				},
				{
					stream: 'conversations',
					expected: {
						method: 'GET',
						path: '/read/conversations',
						apiVersion: '1.2',
						query: {},
					},
				},
				{
					stream: 'a8c_conversations',
					expected: {
						method: 'GET',
						path: '/read/conversations',
						apiVersion: '1.2',
						query: { index: 'a8c' },
					},
				},
				{
					stream: 'search:foo',
					expected: {
						method: 'GET',
						path: '/read/search',
						apiVersion: '1.2',
						query: {
							q: 'foo',
						},
					},
				},
				{
					stream: 'search:foo:bar',
					expected: {
						method: 'GET',
						path: '/read/search',
						apiVersion: '1.2',
						query: {
							q: 'foo:bar',
						},
					},
				},
				{
					stream: 'feed:1234',
					expected: {
						method: 'GET',
						path: '/read/feed/1234/posts',
						apiVersion: '1.2',
						query: {},
					},
				},
				{
					stream: 'site:1234',
					expected: {
						method: 'GET',
						path: '/read/sites/1234/posts',
						apiVersion: '1.2',
						query: {},
					},
				},
				{
					stream: 'featured:1234',
					expected: {
						method: 'GET',
						path: '/read/sites/1234/featured',
						apiVersion: '1.2',
						query: {},
					},
				},
				{
					stream: 'likes',
					expected: {
						method: 'GET',
						path: '/read/liked',
						apiVersion: '1.2',
						query: {},
					},
				},
				{
					stream: 'recommendations_posts',
					expected: {
						method: 'GET',
						path: '/read/recommendations/posts',
						apiVersion: '1.2',
						query: {
							algorithm: 'read:recommendations:posts/es/1',
							seed: expect.any( Number ),
						},
					},
				},
				{
					stream: 'custom_recs_posts_with_images',
					expected: {
						method: 'GET',
						path: '/read/recommendations/posts',
						apiVersion: '1.2',
						query: {
							algorithm: 'read:recommendations:posts/es/7',
							seed: expect.any( Number ),
						},
					},
				},
			].forEach( testCase => {
				it( testCase.stream + ' should pass the expected params', () => {
					const pageAction = requestPageAction( { streamKey: testCase.stream } );
					const expected = {
						onSuccess: pageAction,
						onFailure: pageAction,
						...testCase.expected,
					};
					expect( requestPage( pageAction ) ).toEqual( http( expected ) );
				} );
			} );
		} );
	} );

	describe( 'handlePage', () => {
		const data = deepfreeze( { posts: [] } );

		it( 'should return a receivePage action', () => {
			const { streamKey, query } = action.payload;
			expect( handlePage( action, fromApi( data ) ) ).toEqual(
				receivePage( { streamKey, query, posts: data.posts } )
			);
		} );
	} );

	describe( 'handleError', () => {
		const error = { error: true };

		it( 'should dispatch a notice about the error', () => {
			const notice = errorNotice( 'Could not fetch the next page of posts' );
			delete notice.notice.noticeId;
			expect( handleError( action, error ) ).toMatchObject( notice );
		} );
	} );

	describe( 'fromApi', () => {
		it( 'should return an empty array when data is falsey', () => {
			expect( fromApi( null ) ).toEqual( [] );
			expect( fromApi( undefined ) ).toEqual( [] );
			expect( fromApi( false ) ).toEqual( [] );
			expect( fromApi( {} ) ).toEqual( [] );
			expect( fromApi( { posts: null } ) ).toEqual( [] );
			expect( fromApi( { posts: [] } ) ).toEqual( [] );
		} );
	} );
} );
