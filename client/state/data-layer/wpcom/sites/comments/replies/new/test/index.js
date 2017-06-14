/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import * as Utils from 'state/data-layer/wpcom/sites/utils';
import { writePostComment } from '../';

describe( '#writePostComment()', () => {
	const action = {
		type: 'DUMMY',
		siteId: 2916284,
		postId: 1010,
		commentText: 'comment text'
	};

	it( 'should dispatch a http request action to the new comment replies endpoint', () => {
		const dispatch = spy();
		const dispatchNewCommentRequestSpy = spy( Utils, 'dispatchNewCommentRequest' );

		writePostComment( { dispatch }, {
			...action,
			parentCommentId: 1
		} );

		expect( dispatchNewCommentRequestSpy ).to.have.been.calledOnce;
		expect( dispatchNewCommentRequestSpy ).to.have.been.calledWith(
			dispatch,
			{ ...action, parentCommentId: 1 },
			'/sites/2916284/comments/1/replies/new'
		);
		dispatchNewCommentRequestSpy.restore();
	} );

	it( 'should return if no parent comment id is provided', () => {
		const dispatch = spy();
		const dispatchNewCommentRequestSpy = spy( Utils, 'dispatchNewCommentRequest' );

		writePostComment( { dispatch }, {
			...action,
			parentCommentId: null
		} );

		expect( dispatchNewCommentRequestSpy ).to.have.not.been.called;
		dispatchNewCommentRequestSpy.restore();
	} );
} );
