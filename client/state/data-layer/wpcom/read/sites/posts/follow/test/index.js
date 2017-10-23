/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { requestConversationFollow, receiveConversationFollow } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	followConversation,
	updateConversationFollowStatus,
} from 'state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS_MUTING } from 'state/reader/conversations/follow-status';

describe( 'conversation-follow', () => {
	describe( 'requestConversationFollow', () => {
		test( 'should dispatch an http request', () => {
			const dispatch = spy();
			const action = followConversation( { blogId: 123, postId: 456 } );
			const actionWithRevert = merge( {}, action, {
				meta: {
					previousState: CONVERSATION_FOLLOW_STATUS_MUTING,
				},
			} );
			requestConversationFollow( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/read/sites/123/posts/456/follow',
					body: {},
					apiNamespace: 'wpcom/v2',
					onSuccess: actionWithRevert,
					onFailure: actionWithRevert,
				} )
			);
		} );
	} );

	describe( 'receiveConversationFollow', () => {
		test( 'should dispatch a success notice', () => {
			const dispatch = spy();
			receiveConversationFollow(
				{ dispatch },
				{
					payload: { blogId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS_MUTING },
				},
				{ success: true }
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-success',
				},
			} );
		} );

		test( 'should revert to the previous follow state if it fails', () => {
			const dispatch = spy();
			receiveConversationFollow(
				{ dispatch },
				{
					payload: { blogId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS_MUTING },
				},
				{
					success: false,
				}
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-error',
				},
			} );
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer(
					updateConversationFollowStatus( {
						blogId: 123,
						postId: 456,
						followStatus: CONVERSATION_FOLLOW_STATUS_MUTING,
					} )
				)
			);
		} );
	} );
} );
