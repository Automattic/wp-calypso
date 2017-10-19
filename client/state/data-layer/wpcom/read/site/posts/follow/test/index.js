/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestConversationFollow, receiveConversationFollow } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { followConversation, unfollowConversation } from 'state/reader/conversations/actions';

describe( 'conversation-follow', () => {
	describe( 'requestConversationFollow', () => {
		test( 'should dispatch an http request', () => {
			const dispatch = spy();
			const action = followConversation( 123, 456 );
			requestConversationFollow( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/read/sites/123/posts/456/follow',
					body: {},
					apiNamespace: 'wpcom/v2',
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( 'receiveConversationFollow', () => {
		test( 'should dispatch a success notice', () => {
			const dispatch = spy();
			receiveConversationFollow(
				{ dispatch },
				{ payload: { blogId: 123, postId: 456 } },
				{ success: true }
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-success',
				},
			} );
		} );

		test( 'should dispatch an unfollow if it fails', () => {
			const dispatch = spy();
			receiveConversationFollow(
				{ dispatch },
				{ payload: { blogId: 123, postId: 456 } },
				{
					success: false,
				}
			);
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( unfollowConversation( 123, 456 ) )
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					status: 'is-error',
				},
			} );
		} );
	} );
} );
