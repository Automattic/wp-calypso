/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import freeze from 'deep-freeze';
import { find } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { requestFollowTag, receiveFollowTag, receiveError } from '../';
import { NOTICE_CREATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';
import { requestFollowTag as requestFollowAction, receiveTags as receiveTagsAction } from 'state/reader/tags/items/actions';

export const successfulFollowResponse = freeze( {
	subscribed: true,
	added_tag: '422',
	tags: [
		{
			ID: '422',
			slug: 'poetry',
			title: 'Poetry',
			display_name: 'poetry',
			URL: 'https://public-api.wordpress.com/rest/v1/read/tags/poetry/posts',
		},
		{
			ID: '69750',
			slug: 'ship',
			title: 'SHIP',
			display_name: 'ship',
			URL: 'https://public-api.wordpress.com/rest/v1/read/tags/ship/posts',
		},
	],
} );

const unsuccessfulResponse = freeze( {
	...successfulFollowResponse,
	subscribed: false,
} );

const slug = 'chicken';

describe( 'follow tag request', () => {
	describe( '#requestFollow', () => {
		it( 'should dispatch HTTP request to tag endpoint', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();

			requestFollowTag( { dispatch }, action );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http( {
					apiVersion: '1.1',
					method: 'POST',
					path: `/read/tags/${ slug }/mine/new`,
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( '#receiveFollowSuccess', () => {
		it( 'should dispatch the followed tag with isFollowing=true', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();

			receiveFollowTag( { dispatch }, action, successfulFollowResponse );

			const followedTagId = successfulFollowResponse.added_tag;
			const followedTag = find( successfulFollowResponse.tags, { ID: followedTagId } );
			const normalizedFollowedTag = {
				...fromApi( { tag: followedTag } )[ 0 ],
				isFollowing: true,
			};

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveTagsAction( {
					payload: [ normalizedFollowedTag ],
				} )
			);
		} );

		it( 'if api reports error then create an error notice', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();

			receiveFollowTag( { dispatch }, action, unsuccessfulResponse );
			expect( dispatch ).to.have.been.calledWithMatch( {
				type: NOTICE_CREATE,
			} );
		} );
	} );

	describe( '#receiveError', () => {
		it( 'should dispatch an error notice', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const error = 'could not find tag';

			receiveError( { dispatch }, action, error );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWithMatch( {
				type: NOTICE_CREATE,
			} );
		} );
	} );
} );
