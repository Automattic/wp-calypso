/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';
import deepfreeze from 'deep-freeze';

/**
 * Internal Dependencies
 */
import { _clear as clearInflight } from 'lib/inflight';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	requestPage,
	handlePage,
	handleError,
	transformResponse,
	keyForRequest
} from '../';
import {
	requestPage as requestPageAction,
	receivePage
} from 'state/reader/streams/actions';
import {
	errorNotice
} from 'state/notices/actions';

describe( 'streams', () => {
	const action = deepfreeze( requestPageAction( 'following', { page: 2 } ) );

	describe( 'requestPage', () => {
		let next, dispatch;

		beforeEach( () => {
			next = spy();
			dispatch = spy();
			requestPage( { dispatch }, action, next );
		} );

		afterEach( () => {
			clearInflight();
		} );

		it( 'should dispatch an http request', () => {
			expect( dispatch ).to.have.been.calledWith( http( {
				method: 'GET',
				path: '/read/following',
				apiVersion: '1.2',
				query: action.query,
				onSuccess: action,
				onFailure: action,
			} ) );
		} );

		it( 'should have called next with the original action', () => {
			expect( next ).to.have.been.calledWith( action );
		} );

		it( 'should ignore a second action with the same params', () => {
			next.reset();
			requestPage( { dispatch }, action, next );
			expect( dispatch ).to.have.been.calledOnce;
			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( 'handlePage', () => {
		const next = spy();
		const dispatch = spy();
		const data = deepfreeze( {
			posts: []
		} );

		before( () => {
			handlePage( { dispatch }, action, next, data );
		} );

		it( 'should dispatch receivePage', () => {
			expect( dispatch ).to.have.been.calledWith( receivePage( action.streamId, action.query, data.posts ) );
		} );

		it( 'should swallow the original action', () => {
			expect( next ).to.not.have.been.called;
		} );
	} );

	describe( 'handleError', () => {
		const next = spy();
		const dispatch = spy();
		const error = { error: true };

		before( () => {
			handleError( { dispatch }, action, next, error );
		} );

		it( 'should dispatch a notice about the error', () => {
			const notice = errorNotice( 'Could not fetch the next page of results' );
			delete notice.notice.noticeId;
			expect( dispatch ).to.have.been.calledWithMatch( notice );
		} );
	} );

	describe( 'duplicate requests', () => {
		afterEach( () => {
			clearInflight();
		} );

		it( 'should ignore duplicate requests for the same query', () => {
			const dispatch = spy();
			const next = spy();
			requestPage( { dispatch }, action, next );
			requestPage( { dispatch }, action, next );
			expect( dispatch ).has.been.calledOnce;
			expect( next ).has.been.calledTwice;
		} );

		it( 'should allow more requests once the current one happily completes', () => {
			const dispatch = spy();
			const next = spy();
			requestPage( { dispatch }, action, next );
			handlePage( { dispatch }, action, next, { posts: [] } );
			dispatch.reset();
			next.reset();
			requestPage( { dispatch }, action, next );
			expect( dispatch ).to.have.been.calledWith( http( {
				method: 'GET',
				path: '/read/following',
				apiVersion: '1.2',
				query: action.query,
				onSuccess: action,
				onFailure: action,
			} ) );
		} );

		it( 'should allow more requests even if the current one completes in error', () => {
			const dispatch = spy();
			const next = spy();
			requestPage( { dispatch }, action, next );
			handleError( { dispatch }, action, next, { error: true } );
			dispatch.reset();
			next.reset();
			requestPage( { dispatch }, action, next );
			expect( dispatch ).to.have.been.calledWith( http( {
				method: 'GET',
				path: '/read/following',
				apiVersion: '1.2',
				query: action.query,
				onSuccess: action,
				onFailure: action
			} ) );
		} );
	} );

	describe( 'transformResponse', () => {
		it( 'should return an empty array when data is falsey', () => {
			expect( transformResponse( null ) ).to.eql( [] );
			expect( transformResponse( undefined ) ).to.eql( [] );
			expect( transformResponse( false ) ).to.eql( [] );
			expect( transformResponse( {} ) ).to.eql( [] );
			expect( transformResponse( { posts: null } ) ).to.eql( [] );
			expect( transformResponse( { posts: [] } ) ).to.eql( [] );
		} );
	} );

	describe( 'keyForRequest', () => {
		it( 'should generate a key for an action with no query', () => {
			const key = keyForRequest( requestPageAction( 'following' ) );
			expect( key ).to.equal( 'READER_STREAMS_PAGE_REQUEST-following-' );
		} );

		it( 'should generate a key for an action with a flat query', () => {
			const key = keyForRequest( requestPageAction( 'following', { page: 1 } ) );
			expect( key ).to.equal( 'READER_STREAMS_PAGE_REQUEST-following-&page=1' );
		} );
	} );

	describe( 'stream types', () => {
		afterEach( () => {
			clearInflight();
		} );
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
					query: {}
				}
			},
			{
				stream: 'a8c',
				expected: {
					method: 'GET',
					path: '/read/a8c',
					apiVersion: '1.2',
					query: {}
				}
			},
			{
				stream: 'search:foo',
				expected: {
					method: 'GET',
					path: '/read/search',
					apiVersion: '1.2',
					query: {
						q: 'foo'
					}
				}
			},
			{
				stream: 'search:foo:bar',
				expected: {
					method: 'GET',
					path: '/read/search',
					apiVersion: '1.2',
					query: {
						q: 'foo:bar'
					}
				}
			},
			{
				stream: 'feed:1234',
				expected: {
					method: 'GET',
					path: '/read/feed/1234/posts',
					apiVersion: '1.2',
					query: {}
				}
			},
			{
				stream: 'site:1234',
				expected: {
					method: 'GET',
					path: '/read/sites/1234/posts',
					apiVersion: '1.2',
					query: {}
				}
			},
			{
				stream: 'featured:1234',
				expected: {
					method: 'GET',
					path: '/read/sites/1234/featured',
					apiVersion: '1.2',
					query: {}
				}
			},
			{
				stream: 'likes',
				expected: {
					method: 'GET',
					path: '/read/liked',
					apiVersion: '1.2',
					query: {}
				}
			},
			{
				stream: 'recommendations_posts',
				expected: {
					method: 'GET',
					path: '/read/recommendations/posts',
					apiVersion: '1.2',
					query: {
						algorithm: 'read:recommendations:posts/es/1',
						seed: match.number
					}
				}
			},
			{
				stream: 'custom_recs_posts_with_images',
				expected: {
					method: 'GET',
					path: '/read/recommendations/posts',
					apiVersion: '1.2',
					query: {
						algorithm: 'read:recommendations:posts/es/7',
						seed: match.number
					}
				}
			},
		].forEach( ( testCase ) => {
			it( testCase.stream + ' should pass the expected params', () => {
				const dispatch = spy();
				const next = spy();
				const pageAction = requestPageAction( testCase.stream, {} );
				requestPage( { dispatch }, pageAction, next );
				const expected = Object.assign( {
					onSuccess: pageAction,
					onFailure: pageAction
				}, testCase.expected );
				expect( dispatch ).to.have.been.calledWithMatch( http( expected ) );
				expect( next ).to.have.been.calledOnce;
			} );
		} );
	} );
} );
