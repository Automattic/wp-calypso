/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE
} from 'state/action-types';
import useMockery from 'test/helpers/use-mockery';

describe( 'actions', () => {
	let actions;
	const dispatchSpy = sinon.spy();
	const trackingSpy = sinon.spy();
	const readFeedStub = sinon.stub();
	const readSiteStub = sinon.stub();

	useMockery( mockery => {
		mockery.registerMock( 'lib/analytics', {
			tracks: {
				recordEvent: trackingSpy
			}
		} );

		mockery.registerMock( 'lib/wp', {
			undocumented: () => ( {
				readFeedPost: readFeedStub,
				readSitePost: readSiteStub
			} )
		} );

		actions = require( '../actions' );
	} );

	afterEach( () => {
		dispatchSpy.reset();
		trackingSpy.reset();
		readFeedStub.reset();
		readSiteStub.reset();
	} );

	describe( '#receivePosts()', () => {
		it( 'should return an action object and dispatch posts receive', () => {
			const posts = [];
			return actions.receivePosts( posts )( dispatchSpy ).then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_POSTS_RECEIVE,
					posts
				} );
			} );
		} );

		it( 'should fire tracks events for posts with railcars', () => {
			const posts = [
				{
					ID: 1,
					site_ID: 1,
					global_ID: 1,
					railcar: 'foo'
				}
			];
			actions.receivePosts( posts )( dispatchSpy );
			expect( trackingSpy ).to.have.been.calledWith( 'calypso_traintracks_render', 'foo' );
		} );

		it( 'should try to reload posts marked with should_reload', () => {
			const posts = [
				{
					ID: 1,
					site_ID: 1,
					global_ID: 1,
					railcar: '1234',
					_should_reload: true
				}
			];

			actions.receivePosts( posts )( dispatchSpy );
			return expect( dispatchSpy ).to.have.been.calledWith( sinon.match.func );
		} );
	} );

	describe( '#fetchPost', () => {
		it( 'should call read/sites for blog posts', () => {
			readSiteStub.returns( Promise.resolve( {} ) );
			const req = actions.fetchPost( { blogId: 1, postId: 2 } )( dispatchSpy );

			expect( readSiteStub ).to.have.been.calledWith( {
				site: 1,
				postId: 2
			} );

			return req.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( sinon.match.func );
			} );
		} );

		it( 'should call read/feeds for feed posts', () => {
			readFeedStub.returns( Promise.resolve( {} ) );
			const req = actions.fetchPost( { feedId: 1, postId: 2 } )( dispatchSpy );

			expect( readFeedStub ).to.have.been.calledWith( {
				feedId: 1,
				postId: 2
			} );

			return req.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( sinon.match.func );
			} );
		} );

		it( 'should dispatch an error when a blog post call fails', () => {
			readSiteStub.returns( Promise.reject( { status: 'oh no' } ) );
			const req = actions.fetchPost( { blogId: 1, postId: 2 } )( dispatchSpy );

			expect( readSiteStub ).to.have.been.calledWith( {
				site: 1,
				postId: 2
			} );

			return req.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_POSTS_RECEIVE,
					posts: [ {
						ID: 2,
						site_ID: 1,
						is_external: false,
						is_error: true,
						error: { status: 'oh no' },
						feed_ID: undefined,
						global_ID: 'na-1-2'
					} ]
				} );
			} );
		} );

		it( 'should dispatch an error when a feed post call fails', () => {
			readFeedStub.returns( Promise.reject( { status: 'oh no' } ) );
			const req = actions.fetchPost( { feedId: 1, postId: 2 } )( dispatchSpy );

			expect( readFeedStub ).to.have.been.calledWith( {
				feedId: 1,
				postId: 2
			} );

			return req.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_POSTS_RECEIVE,
					posts: [ {
						ID: 2,
						site_ID: undefined,
						is_external: true,
						is_error: true,
						error: { status: 'oh no' },
						feed_ID: 1,
						global_ID: '1-na-2'
					} ]
				} );
			} );
		} );
	} );
} );
