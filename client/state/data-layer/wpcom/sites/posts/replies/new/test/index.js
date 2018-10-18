/** @format */
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { writePostComment } from '../';
import { dispatchNewCommentRequest } from 'state/data-layer/wpcom/sites/utils.js';

jest.mock( 'state/data-layer/wpcom/sites/utils.js' );

describe( '#writePostComment()', () => {
	const action = {
		type: 'DUMMY',
		siteId: 2916284,
		postId: 1010,
		commentText: 'comment text',
	};

	test( 'should dispatch a http request action to the new post replies endpoint', () => {
		writePostComment( action );

		expect( dispatchNewCommentRequest ).toHaveBeenCalledOnce;
		expect( dispatchNewCommentRequest ).toHaveBeenCalledWith(
			action,
			'/sites/2916284/posts/1010/replies/new'
		);
	} );
} );
