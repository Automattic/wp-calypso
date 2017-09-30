/** @format */
jest.mock( 'state/reader/posts/actions', () => ( {
	receivePosts: posts => Promise.resolve( posts )
} ) );

/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_RECORD_FOLLOW,
	READER_RECORD_UNFOLLOW,
	READER_FOLLOW_ERROR,
} from 'state/action-types';
import { recordFollowError } from '../actions';

describe( 'actions', () => {
	let recordFollow, recordUnfollow;

	before( () => {
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
				type: READER_RECORD_FOLLOW,
				payload: { url: 'http://discover.wordpress.com' },
			} );
		} );
	} );

	describe( '#recordUnfollow', () => {
		it( 'should dispatch an action when a URL is unfollowed', () => {
			recordUnfollow( 'http://discover.wordpress.com' )( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_RECORD_UNFOLLOW,
				payload: { url: 'http://discover.wordpress.com' },
			} );
		} );
	} );

	describe( '#recordFollowError', () => {
		it( 'should dispatch an action on follow error', () => {
			const action = recordFollowError( 'http://discover.wordpress.com', 'invalid_feed' );
			expect( action ).to.deep.equal( {
				type: READER_FOLLOW_ERROR,
				payload: { feedUrl: 'http://discover.wordpress.com', error: 'invalid_feed' },
			} );
		} );
	} );
} );
