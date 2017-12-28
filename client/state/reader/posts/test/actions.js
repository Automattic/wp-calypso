/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import * as actions from '../actions';
import { tracks } from 'client/lib/analytics';
import { READER_POSTS_RECEIVE } from 'client/state/action-types';
import wp from 'client/lib/wp';

const undocumented = wp.undocumented;

jest.mock( 'lib/analytics', () => ( {
	tracks: {
		recordEvent: require( 'sinon' ).spy(),
	},
} ) );

jest.mock( 'lib/wp', () => {
	const { stub } = require( 'sinon' );
	const readFeedPost = stub();
	const readSitePost = stub();

	return {
		undocumented: () => ( {
			readFeedPost,
			readSitePost,
		} ),
	};
} );

describe( 'actions', () => {
	const dispatchSpy = sinon.spy();
	const trackingSpy = tracks.recordEvent;
	const readFeedStub = undocumented().readFeedPost;
	const readSiteStub = undocumented().readSitePost;

	afterEach( () => {
		dispatchSpy.reset();
		trackingSpy.reset();
		readFeedStub.reset();
		readSiteStub.reset();
	} );

	describe( '#postToKey', () => {
		test( 'should return a feed key for an external post', () => {
			expect(
				actions.postToKey( {
					feed_ID: 1,
					site_ID: 1,
					ID: 3,
					feed_item_ID: 3,
					is_external: true,
				} )
			).to.deep.equal( { feedId: 1, postId: 3 } );
		} );

		test( 'should return an blog id key for an internal post', () => {
			expect(
				actions.postToKey( {
					site_ID: 2,
					ID: 4,
					is_external: false,
				} )
			).to.deep.equal( { blogId: 2, postId: 4 } );
		} );

		test( 'should return a feed key for a post with both a feed id and a site id', () => {
			expect(
				actions.postToKey( {
					feed_ID: 1,
					site_ID: 2,
					ID: 4,
					feed_item_ID: 3,
					is_external: false,
				} )
			).to.deep.equal( { feedId: 1, postId: 3 } );
		} );
	} );

	describe( '#receivePosts()', () => {
		test( 'should return an action object and dispatch posts receive', () => {
			const posts = [];
			return actions.receivePosts( posts )( dispatchSpy ).then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_POSTS_RECEIVE,
					posts,
				} );
			} );
		} );

		test( 'should fire tracks events for posts with railcars', () => {
			const posts = [
				{
					ID: 1,
					site_ID: 1,
					global_ID: 1,
					railcar: 'foo',
				},
			];
			actions.receivePosts( posts )( dispatchSpy );
			expect( trackingSpy ).to.have.been.calledWith( 'calypso_traintracks_render', 'foo' );
		} );

		test( 'should try to reload posts marked with should_reload', () => {
			const posts = [
				{
					ID: 1,
					site_ID: 1,
					global_ID: 1,
					railcar: '1234',
					_should_reload: true,
				},
			];

			actions.receivePosts( posts )( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( sinon.match.func );
		} );
	} );

	describe( '#fetchPost', () => {
		test( 'should call read/sites for blog posts', () => {
			readSiteStub.returns( Promise.resolve( {} ) );
			const req = actions.fetchPost( { blogId: 1, postId: 2 } )( dispatchSpy );

			expect( readSiteStub ).to.have.been.calledWith( {
				site: 1,
				postId: 2,
			} );

			return req.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( sinon.match.func );
			} );
		} );

		test( 'should call read/feeds for feed posts', () => {
			readFeedStub.returns( Promise.resolve( {} ) );
			const req = actions.fetchPost( { feedId: 1, postId: 2 } )( dispatchSpy );

			expect( readFeedStub ).to.have.been.calledWith( {
				feedId: 1,
				postId: 2,
			} );

			return req.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( sinon.match.func );
			} );
		} );

		test( 'should dispatch an error when a blog post call fails', () => {
			readSiteStub.returns( Promise.reject( { status: 'oh no' } ) );
			const req = actions.fetchPost( { blogId: 1, postId: 2 } )( dispatchSpy );

			expect( readSiteStub ).to.have.been.calledWith( {
				site: 1,
				postId: 2,
			} );

			return req.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_POSTS_RECEIVE,
					posts: [
						{
							ID: 2,
							site_ID: 1,
							is_external: false,
							is_error: true,
							error: { status: 'oh no' },
							feed_ID: undefined,
							global_ID: 'na-1-2',
						},
					],
				} );
			} );
		} );

		test( 'should dispatch an error when a feed post call fails', () => {
			readFeedStub.returns( Promise.reject( { status: 'oh no' } ) );
			const req = actions.fetchPost( { feedId: 1, postId: 2 } )( dispatchSpy );

			expect( readFeedStub ).to.have.been.calledWith( {
				feedId: 1,
				postId: 2,
			} );

			return req.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_POSTS_RECEIVE,
					posts: [
						{
							ID: 2,
							site_ID: undefined,
							is_external: true,
							is_error: true,
							error: { status: 'oh no' },
							feed_ID: 1,
							global_ID: '1-na-2',
						},
					],
				} );
			} );
		} );
	} );
} );
