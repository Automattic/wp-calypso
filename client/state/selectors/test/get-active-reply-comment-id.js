/** @format */
/**
 * Internal dependencies
 */
import { getActiveReplyCommentId } from '../';

describe( 'getActiveReplyCommentId()', () => {
	it( 'should return the active reply comment ID for a known site and post', () => {
		const prevState = {
			comments: {
				activeReplyComments: {
					'1-2': 124,
				},
			},
		};
		const siteId = 1;
		const postId = 2;
		const nextState = getActiveReplyCommentId( prevState, siteId, postId );
		expect( nextState ).toEqual( 124 );
	} );

	it( 'should return null for an unknown site and post', () => {
		const prevState = {
			comments: {
				activeReplyComments: {
					'1-2': 124,
				},
			},
		};
		const siteId = 1;
		const postId = 3;
		const nextState = getActiveReplyCommentId( prevState, siteId, postId );
		expect( nextState ).toEqual( null );
	} );
} );
