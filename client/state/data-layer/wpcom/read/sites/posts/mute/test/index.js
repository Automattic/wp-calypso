/** @format */

/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { requestConversationMute, receiveConversationMute } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	muteConversation,
	updateConversationFollowStatus,
} from 'state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'state/reader/conversations/follow-status';

describe( 'conversation-mute', () => {
	describe( 'requestConversationMute', () => {
		test( 'should dispatch an http request', () => {
			const dispatch = jest.fn();
			const action = muteConversation( { siteId: 123, postId: 456 } );
			const actionWithRevert = merge( {}, action, {
				meta: {
					previousState: CONVERSATION_FOLLOW_STATUS.following,
				},
			} );
			const getState = () => {
				return {
					reader: {
						conversations: {
							items: {
								'123-456': 'F',
							},
						},
					},
				};
			};
			requestConversationMute( { dispatch, getState }, action );
			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'POST',
						path: '/read/sites/123/posts/456/mute',
						body: {},
						apiNamespace: 'wpcom/v2',
					},
					actionWithRevert
				)
			);
		} );
	} );

	describe( 'receiveConversationMute', () => {
		test( 'should dispatch a success notice', () => {
			const dispatch = jest.fn();
			receiveConversationMute(
				{ dispatch },
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS.following },
				},
				{ success: true }
			);
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-plain',
					} ),
				} )
			);
		} );

		test( 'should revert to the previous follow state if it fails', () => {
			const dispatch = jest.fn();
			receiveConversationMute(
				{ dispatch },
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS.following },
				},
				{
					success: false,
				}
			);
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			);
			expect( dispatch ).toHaveBeenCalledWith(
				bypassDataLayer(
					updateConversationFollowStatus( {
						siteId: 123,
						postId: 456,
						followStatus: CONVERSATION_FOLLOW_STATUS.following,
					} )
				)
			);
		} );
	} );
} );
