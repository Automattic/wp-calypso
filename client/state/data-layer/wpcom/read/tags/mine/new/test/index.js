/**
 * External dependencies
 */
import freeze from 'deep-freeze';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { requestFollowTag, receiveFollowTag, receiveError } from '../';
import { NOTICE_CREATE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { fromApi } from 'calypso/state/data-layer/wpcom/read/tags/utils';
import {
	requestFollowTag as requestFollowAction,
	receiveTags as receiveTagsAction,
} from 'calypso/state/reader/tags/items/actions';

const successfulFollowResponse = freeze( {
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

const slug = 'chicken';

describe( 'follow tag request', () => {
	describe( '#requestFollow', () => {
		test( 'should dispatch HTTP request to tag endpoint', () => {
			const action = requestFollowAction( slug );

			expect( requestFollowTag( action ) ).toEqual(
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
		test( 'should return the followed tag with isFollowing=true', () => {
			const action = requestFollowAction( slug );

			const followedTagId = successfulFollowResponse.added_tag;
			const followedTag = find( successfulFollowResponse.tags, { ID: followedTagId } );
			const normalizedFollowedTag = {
				...fromApi( { tag: followedTag } )[ 0 ],
				isFollowing: true,
			};

			expect( receiveFollowTag( action, [ normalizedFollowedTag ] ) ).toMatchObject(
				receiveTagsAction( {
					payload: [ normalizedFollowedTag ],
				} )
			);
		} );
	} );

	describe( '#receiveError', () => {
		test( 'should dispatch an error notice', () => {
			const action = requestFollowAction( slug );
			const error = 'could not find tag';

			expect( receiveError( action, error ) ).toMatchObject( {
				type: NOTICE_CREATE,
			} );
		} );
	} );
} );
