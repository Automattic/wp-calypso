/**
 * Internal dependencies
 */
import { requestUnfollow, receiveUnfollowTag, receiveError, fromApi } from '../';
import { NOTICE_CREATE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	requestUnfollowTag as requestUnfollowAction,
	receiveUnfollowTag as receiveUnfollowAction,
} from 'calypso/state/reader/tags/items/actions';

const successfulUnfollowResponse = {
	subscribed: false,
	removed_tag: '307',
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
};

const slug = 'chicken';

describe( 'unfollow tag request', () => {
	describe( '#requestUnfollow', () => {
		test( 'should return an HTTP request to the unfollow tag endpoint', () => {
			const action = requestUnfollowAction( slug );

			expect( requestUnfollow( action ) ).toMatchObject(
				http( {
					apiVersion: '1.1',
					method: 'POST',
					path: `/read/tags/${ slug }/mine/delete`,
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( '#receiveUnfollowSuccess', () => {
		test( 'should return the id of the unfollowed tag', () => {
			const action = requestUnfollowAction( slug );

			expect( receiveUnfollowTag( action, fromApi( successfulUnfollowResponse ) ) ).toMatchObject(
				receiveUnfollowAction( {
					payload: successfulUnfollowResponse.removed_tag,
				} )
			);
		} );
	} );

	describe( '#receiveError', () => {
		test( 'should dispatch an error notice', () => {
			const action = requestUnfollowAction( slug );
			const error = 'could not find tag';

			expect( receiveError( action, error ) ).toMatchObject( {
				type: NOTICE_CREATE,
			} );
		} );
	} );

	describe( '#fromApi', () => {
		test( 'should extract the removed_tag from a response', () => {
			const apiResponse = successfulUnfollowResponse;
			const normalized = fromApi( apiResponse );

			expect( normalized ).toEqual( apiResponse.removed_tag );
		} );
	} );
} );
