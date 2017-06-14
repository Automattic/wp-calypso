/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import * as Utils from 'state/data-layer/wpcom/sites/utils';
import { newPostReply } from '../';

describe( '#newPostReply()', () => {
	const action = {
		type: 'DUMMY',
		siteId: 2916284,
		postId: 1010,
		commentText: 'comment text'
	};

	it( 'should dispatch a http request action to the new post replies endpoint', () => {
		const dispatch = spy();
		const dispatchNewCommentRequestSpy = spy( Utils, 'dispatchNewCommentRequest' );

		newPostReply( { dispatch }, {
			...action,
			parentCommentId: null
		} );

		expect( dispatchNewCommentRequestSpy ).to.have.been.calledOnce;
		expect( dispatchNewCommentRequestSpy ).to.have.been.calledWith(
			dispatch,
			{ ...action, parentCommentId: null },
			'/sites/2916284/posts/1010/replies/new'
		);

		dispatchNewCommentRequestSpy.restore();
	} );

	it( 'should return if parent comment id is provided', () => {
		const dispatch = spy();
		const dispatchNewCommentRequestSpy = spy( Utils, 'dispatchNewCommentRequest' );

		newPostReply( { dispatch }, {
			...action,
			parentCommentId: 1
		} );

		expect( dispatchNewCommentRequestSpy ).to.have.not.been.called;
		dispatchNewCommentRequestSpy.restore();
	} );
} );
