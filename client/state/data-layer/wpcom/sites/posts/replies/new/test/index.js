/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { writePostComment } from '../';
import * as Utils from 'client/state/data-layer/wpcom/sites/utils';

describe( '#writePostComment()', () => {
	const action = {
		type: 'DUMMY',
		siteId: 2916284,
		postId: 1010,
		commentText: 'comment text',
	};

	test( 'should dispatch a http request action to the new post replies endpoint', () => {
		const dispatch = spy();
		const dispatchNewCommentRequestSpy = spy( Utils, 'dispatchNewCommentRequest' );

		writePostComment( { dispatch }, action );

		expect( dispatchNewCommentRequestSpy ).to.have.been.calledOnce;
		expect( dispatchNewCommentRequestSpy ).to.have.been.calledWith(
			dispatch,
			action,
			'/sites/2916284/posts/1010/replies/new'
		);

		dispatchNewCommentRequestSpy.restore();
	} );
} );
