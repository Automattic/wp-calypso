/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import { requestTags, receiveTagsSuccess, receiveTagsError } from '../';
import { NOTICE_CREATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';
import {
	requestTags as requestTagsAction,
	receiveTags as receiveTagsAction,
} from 'state/reader/tags/items/actions';

const successfulFollowedTagsResponse = deepFreeze( {
	tags: [
		{
			ID: '307',
			slug: 'chickens',
			title: 'Chickens',
			display_name: 'chickens',
			URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts',
		},
		{
			ID: '148',
			slug: 'design',
			title: 'Design',
			display_name: 'design',
			URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/design/posts',
		},
	],
} );

const successfulSingleTagResponse = deepFreeze( {
	tag: {
		ID: '307',
		slug: 'chickens',
		title: 'Chickens',
		display_name: 'chickens',
		URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts',
	},
} );

const slug = 'chickens';

describe( 'wpcom-api', () => {
	describe( 'request tags', () => {
		describe( '#requestTags', () => {
			test( 'single tag: should dispatch HTTP request to tag endpoint', () => {
				const action = requestTagsAction( slug );

				expect( requestTags( action ) ).toMatchObject(
					http( {
						apiVersion: '1.2',
						method: 'GET',
						path: `/read/tags/${ slug }`,
						onSuccess: action,
						onFailure: action,
					} )
				);
			} );

			test( 'multiple tags: should dispatch HTTP request to tags endpoint', () => {
				const action = requestTagsAction();

				expect( requestTags( action ) ).toMatchObject(
					http( {
						apiVersion: '1.2',
						method: 'GET',
						path: '/read/tags',
						onSuccess: action,
						onFailure: action,
					} )
				);
			} );
		} );

		describe( '#receiveTagsResponse', () => {
			test( 'single tag: should normalize + dispatch', () => {
				const action = requestTagsAction( slug );

				expect(
					receiveTagsSuccess( action, fromApi( successfulSingleTagResponse ) )
				).toMatchObject(
					receiveTagsAction( {
						payload: fromApi( successfulSingleTagResponse ),
						resetFollowingData: false,
					} )
				);
			} );

			test( 'multiple tags: should dispatch the tags', () => {
				const action = requestTagsAction();

				const transformedResponse = map( fromApi( successfulFollowedTagsResponse ), ( tag ) => ( {
					...tag,
					isFollowing: true,
				} ) );

				expect(
					receiveTagsSuccess( action, fromApi( successfulFollowedTagsResponse ) )
				).toMatchObject(
					receiveTagsAction( {
						payload: transformedResponse,
						resetFollowingData: true,
					} )
				);
			} );
		} );

		describe( '#receiveTagsError', () => {
			test( 'should return an error notice', () => {
				const action = requestTagsAction( slug );
				const error = 'could not find tag(s)';

				expect( receiveTagsError( action, error )[ 0 ] ).toMatchObject( {
					type: NOTICE_CREATE,
				} );
			} );

			test( 'should not dispatch error notice if the error is a 404', () => {
				const action = {
					...requestTagsAction( slug ),
					meta: {
						dataLayer: {
							headers: { status: 404 },
						},
					},
				};
				const error = 'could not find tag(s)';

				expect( receiveTagsError( action, error ) ).toMatchObject(
					receiveTagsAction( {
						payload: [ { id: slug, slug, error: true } ],
					} )
				);
			} );
		} );
	} );
} );
