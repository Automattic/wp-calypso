/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { requestConversationMute, receiveConversationMute } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { updateConversationFollowStatus } from 'calypso/state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';

describe( 'conversation-mute', () => {
	describe( 'requestConversationMute', () => {
		test( 'should dispatch an http request', () => {
			const action = {
				payload: { siteId: 123, postId: 456 },
				meta: { previousState: CONVERSATION_FOLLOW_STATUS.following },
			};

			const result = requestConversationMute( action );
			expect( result ).toEqual(
				http(
					{
						method: 'POST',
						path: '/read/sites/123/posts/456/mute',
						body: {},
						apiNamespace: 'wpcom/v2',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveConversationMute', () => {
		test( 'should dispatch a success notice', () => {
			const result = receiveConversationMute(
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS.following },
				},
				{ success: true }
			);
			expect( result ).toMatchObject( {
				notice: {
					status: 'is-plain',
				},
			} );
		} );

		test( 'should revert to the previous follow state if it fails', () => {
			const result = receiveConversationMute(
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS.following },
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
					followStatus: CONVERSATION_FOLLOW_STATUS.following,
				} )
			);
		} );
	} );
} );
