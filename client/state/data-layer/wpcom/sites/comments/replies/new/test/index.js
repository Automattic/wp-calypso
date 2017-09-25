/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { writeReplyComment } from '../';
import * as Utils from 'state/data-layer/wpcom/sites/utils';

describe( '#writeReplyComment()', () => {
	const action = {
		type: 'DUMMY',
		siteId: 2916284,
		postId: 1010,
		parentCommentId: 1,
		commentText: 'comment text',
	};

	it( 'should dispatch a http request action to the new comment replies endpoint', () => {
		const dispatch = spy();
		const dispatchNewCommentRequestSpy = spy( Utils, 'dispatchNewCommentRequest' );

		writeReplyComment( { dispatch }, action );

		expect( dispatchNewCommentRequestSpy ).to.have.been.calledOnce;
		expect( dispatchNewCommentRequestSpy ).to.have.been.calledWith(
			dispatch,
			action,
			'/sites/2916284/comments/1/replies/new',
		);
		dispatchNewCommentRequestSpy.restore();
	} );
} );
