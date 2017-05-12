/*
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { requestUnfollowTag, receiveUnfollowTag } from 'state/reader/tags/items/actions';
import { errorNotice } from 'state/notices/actions';

import { http } from 'state/data-layer/wpcom-http/actions';
import {
	isValidResponse,
	mapActionToHttp,
	mapSuccessfulResponseToActions,
	mapFailureResponseToActions,
} from '../';

const successfulUnfollowResponse = {
	subscribed: false,
	removed_tag: '307',
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
};

const failureResponse = {
	...successfulUnfollowResponse,
	subscribed: true,
};

const slug = 'chicken';

describe( 'Unfollow Tag: read/tags/mine/{tag}/delete', () => {
	describe( '#mapActionToHttp', () => {
		it( 'should correctly map an input action to a http request action', () => {
			const action = requestUnfollowTag( slug );
			const expectedHttpAction = http( {
				apiVersion: '1.1',
				method: 'POST',
				path: `/read/tags/${ slug }/mine/delete`,
				onSuccess: action,
				onFailure: action,
			} );

			expect( mapActionToHttp( action ) ).eql( expectedHttpAction );
		} );
	} );

	describe( '#isValidResponse', () => {
		it( 'should identify a response that says still subscribed as an error', () => {
			expect( isValidResponse( failureResponse ) ).false;
		} );

		it( 'should identify a successful response correctly', () => {
			expect( isValidResponse( successfulUnfollowResponse ) ).true;
		} );
	} );

	describe( '#mapSuccessfulResponseToActions', () => {
		it( 'should properly dispatch remove tag action', () => {
			const expectedActions = [
				receiveUnfollowTag( successfulUnfollowResponse.removed_tag ),
			];

			expect(
				mapSuccessfulResponseToActions( { apiResponse: successfulUnfollowResponse } )
			).eql( expectedActions );
		} );
	} );

	describe( '#mapFailureResponseToActions', () => {
		it( 'should properly dispatch error notice', () => {
			const expectedActions = [
				errorNotice( `Could not unfollow tag: ${ slug }` ),
			];

			expect(
				mapFailureResponseToActions( {
					action: requestUnfollowTag( slug )
				} ).text
			).eql( expectedActions.text );
		} );
	} );
} );
