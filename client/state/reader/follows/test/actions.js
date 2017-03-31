/**
 * External dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
} from 'state/action-types';

describe( 'actions', () => {
	let recordFollow, recordUnfollow;

	useMockery( mockery => {
		mockery.registerMock( 'state/reader/posts/actions', {
			receivePosts: ( posts ) => {
				return Promise.resolve( posts );
			}
		} );

		const actions = require( '../actions' );
		recordFollow = actions.recordFollow;
		recordUnfollow = actions.recordUnfollow;
	} );

	const spy = sinon.spy();
	const dispatchSpy = sinon.stub();
	dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );

	beforeEach( () => {
		spy.reset();
		dispatchSpy.reset();
	} );

	describe( '#recordFollow', () => {
		it( 'should dispatch an action when a URL is followed', () => {
			recordFollow( 'http://discover.wordpress.com' )( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_FOLLOW,
				payload: { url: 'http://discover.wordpress.com' },
			} );
		} );
	} );

	describe( '#recordUnfollow', () => {
		it( 'should dispatch an action when a URL is unfollowed', () => {
			recordUnfollow( 'http://discover.wordpress.com' )( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_UNFOLLOW,
				payload: { url: 'http://discover.wordpress.com' }
			} );
		} );
	} );
} );
