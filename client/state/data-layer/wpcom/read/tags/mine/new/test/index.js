/*
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { find } from 'lodash';
import freeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	requestFollowTag as requestFollowAction,
	receiveTags as receiveTagsAction,
} from 'state/reader/tags/items/actions';
import {
	requestFollowTag,
	receiveFollowTag,
	receiveError,
} from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';
import { NOTICE_CREATE } from 'state/action-types';

export const successfulFollowResponse = freeze( {
	subscribed: true,
	added_tag: '422',
	tags: [
		{
			ID: '422',
			slug: 'poetry',
			title: 'Poetry',
			display_name: 'poetry',
			URL: 'https://public-api.wordpress.com/rest/v1/read/tags/poetry/posts'
		},
		{
			ID: '69750',
			slug: 'ship',
			title: 'SHIP',
			display_name: 'ship',
			URL: 'https://public-api.wordpress.com/rest/v1/read/tags/ship/posts'
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
			const next = sinon.spy();

			requestFollowTag( { dispatch }, action, next );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( http( {
				apiVersion: '1.1',
				method: 'POST',
				path: `/read/tags/${ slug }/mine/new`,
				onSuccess: action,
				onFailure: action,
			} ) );
		} );

		it( 'should pass the original action along the middleware chain', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			requestFollowTag( { dispatch }, action, next );

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( '#receiveFollowSuccess', () => {
		it( 'should dispatch the followed tag with isFollowing=true', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			receiveFollowTag( { dispatch }, action, next, successfulFollowResponse );

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
			const next = sinon.spy();

			receiveFollowTag( { dispatch }, action, next, unsuccessfulResponse );
			expect( dispatch ).to.have.been.calledWithMatch( {
				type: NOTICE_CREATE,
			} );
		} );
	} );

	describe( '#receiveError', () => {
		it( 'should dispatch an error notice', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();
			const error = 'could not find tag';

			receiveError( { dispatch }, action, next, error );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWithMatch( {
				type: NOTICE_CREATE,
			} );
		} );
	} );
} );
