/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { writeReplyComment } from '../';
import * as Utils from 'calypso/state/data-layer/wpcom/sites/utils';

describe( '#writeReplyComment()', () => {
	const action = {
		type: 'DUMMY',
		siteId: 2916284,
		postId: 1010,
		parentCommentId: 1,
		commentText: 'comment text',
	};

	test( 'should dispatch a http request action to the new comment replies endpoint', () => {
		const dispatchNewCommentRequestSpy = spy( Utils, 'dispatchNewCommentRequest' );
		writeReplyComment( action );

		expect( dispatchNewCommentRequestSpy ).to.have.been.calledOnce;
		expect( dispatchNewCommentRequestSpy ).to.have.been.calledWith(
			action,
			'/sites/2916284/comments/1/replies/new'
		);
		dispatchNewCommentRequestSpy.restore();
	} );
} );
