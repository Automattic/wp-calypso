/**
 * Internal dependencies
 */
import { getActiveReplyCommentId } from 'calypso/state/comments/selectors';

describe( 'getActiveReplyCommentId()', () => {
	test( 'should return the active reply comment ID for a known site and post', () => {
		const prevState = {
			comments: {
				activeReplies: {
					'1-2': 124,
				},
			},
		};
		const siteId = 1;
		const postId = 2;
		const nextState = getActiveReplyCommentId( { state: prevState, siteId, postId } );
		expect( nextState ).toEqual( 124 );
	} );

	test( 'should return null for an unknown site and post', () => {
		const prevState = {
			comments: {
				activeReplies: {
					'1-2': 124,
				},
			},
		};
		const siteId = 1;
		const postId = 3;
		const nextState = getActiveReplyCommentId( { state: prevState, siteId, postId } );
		expect( nextState ).toEqual( null );
	} );
} );
