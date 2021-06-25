/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { requestConversationFollow, receiveConversationFollow } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { updateConversationFollowStatus } from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';

describe( 'conversation-follow', () => {
	describe( 'requestConversationFollow', () => {
		test( 'should dispatch an http request', () => {
			const action = {
				payload: { siteId: 123, postId: 456 },
				meta: { previousState: CONVERSATION_FOLLOW_STATUS.muting },
			};
			const result = requestConversationFollow( action );
			expect( result ).toEqual(
				http(
					{
						method: 'POST',
						path: '/read/sites/123/posts/456/follow',
						body: {},
						apiNamespace: 'wpcom/v2',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveConversationFollow', () => {
		test( 'should dispatch a success notice', () => {
			const result = receiveConversationFollow(
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS.muting },
				},
				{ success: true }
			);
			expect( result ).toMatchObject( {
				notice: {
					status: 'is-success',
				},
			} );
		} );

		test( 'should revert to the previous follow state if it fails', () => {
			const result = receiveConversationFollow(
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS.muting },
				},
				{
					success: false,
				}
			);
			expect( result[ 0 ] ).toMatchObject( {
				notice: {
					status: 'is-error',
				},
			} );
			expect( result[ 1 ] ).toMatchObject(
				updateConversationFollowStatus( {
					siteId: 123,
					postId: 456,
					followStatus: CONVERSATION_FOLLOW_STATUS.muting,
				} )
			);
		} );
	} );
} );
