/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
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
				apiVersion: 'v1.2',
				query: action.query
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
			expect( dispatch ).to.have.been.calledWith( receivePage( action.streamId, action.query, data ) );
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
				apiVersion: 'v1.2',
				query: action.query
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
				apiVersion: 'v1.2',
				query: action.query
			} ) );
		} );
	} );

	describe( 'transformResponse', () => {
		it( 'should return an empty array when data is falsey', () => {
			expect( transformResponse( null ) ).to.eql( { posts: [] } );
			expect( transformResponse( undefined ) ).to.eql( { posts: [] } );
			expect( transformResponse( false ) ).to.eql( { posts: [] } );
			expect( transformResponse( {} ) ).to.eql( { posts: [] } );
			expect( transformResponse( { posts: null } ) ).to.eql( { posts: [] } );
			expect( transformResponse( { posts: [] } ) ).to.eql( { posts: [] } );
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
} );
