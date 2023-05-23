import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE,
} from 'calypso/state/reader/action-types';
import { items, queuedRequests } from '../reducer';

describe( 'items', () => {
	test( 'should store the posts by global_ID', () => {
		expect(
			items(
				{},
				{
					type: READER_RELATED_POSTS_RECEIVE,
					payload: {
						siteId: 1,
						postId: 1,
						size: 5,
						posts: [
							{ global_ID: 2 },
							{ global_ID: 3 },
							{ global_ID: 4 },
							{ global_ID: 5 },
							{ global_ID: 6 },
						],
					},
				}
			)
		).toEqual( {
			'1-1-all-5': [ 2, 3, 4, 5, 6 ],
		} );
	} );

	test( 'should overwrite existing posts', () => {
		expect(
			items(
				{
					'1-1-all-5': [ 2, 3, 4, 5, 6 ],
				},
				{
					type: READER_RELATED_POSTS_RECEIVE,
					payload: {
						siteId: 1,
						postId: 1,
						size: 5,
						posts: [
							{ global_ID: 3 },
							{ global_ID: 4 },
							{ global_ID: 9 },
							{ global_ID: 10 },
							{ global_ID: 11 },
						],
					},
				}
			)
		).toEqual( {
			'1-1-all-5': [ 3, 4, 9, 10, 11 ],
		} );
	} );
} );

describe( 'queuedRequests', () => {
	test( 'request should set the flag', () => {
		expect(
			queuedRequests(
				{},
				{
					type: READER_RELATED_POSTS_REQUEST,
					payload: {
						siteId: 1,
						postId: 1,
						size: 5,
					},
				}
			)
		).toEqual( {
			'1-1-all-5': true,
		} );
	} );

	test( 'request success should unset the flag', () => {
		expect(
			queuedRequests(
				{
					'1-1-all-5': true,
				},
				{
					type: READER_RELATED_POSTS_REQUEST_SUCCESS,
					payload: {
						siteId: 1,
						postId: 1,
						size: 5,
					},
				}
			)
		).toEqual( {
			'1-1-all-5': false,
		} );
	} );

	test( 'request failure should unset the flag', () => {
		expect(
			queuedRequests(
				{},
				{
					type: READER_RELATED_POSTS_REQUEST_FAILURE,
					payload: {
						siteId: 1,
						postId: 1,
						size: 5,
					},
				}
			)
		).toEqual( {
			'1-1-all-5': false,
		} );
	} );
} );
