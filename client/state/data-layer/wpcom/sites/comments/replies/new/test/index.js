/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { writeReplyComment } from '../';
import { dispatchNewCommentRequest } from 'state/data-layer/wpcom/sites/utils';

jest.mock( 'state/data-layer/wpcom/sites/utils' );

describe( '#writeReplyComment()', () => {
	const action = {
		type: 'DUMMY',
		siteId: 2916284,
		postId: 1010,
		parentCommentId: 1,
		commentText: 'comment text',
	};

	test( 'should dispatch a http request action to the new comment replies endpoint', () => {
		writeReplyComment( action );

		expect( dispatchNewCommentRequest ).toHaveBeendCalledOnce;
		expect( dispatchNewCommentRequest ).toHaveBeenCalledWith(
			action,
			'/sites/2916284/comments/1/replies/new'
		);
	} );
} );
