/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { items, queuedRequests } from '../reducer';
import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE,
} from 'calypso/state/reader/action-types';

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
						posts: [ { global_ID: 2 }, { global_ID: 3 }, { global_ID: 4 } ],
					},
				}
			)
		).to.deep.equal( {
			'1-1-all': [ 2, 3, 4 ],
		} );
	} );

	test( 'should overwrite existing posts', () => {
		expect(
			items(
				{
					'1-1-all': [ 2, 3, 4 ],
				},
				{
					type: READER_RELATED_POSTS_RECEIVE,
					payload: {
						siteId: 1,
						postId: 1,
						posts: [ { global_ID: 3 }, { global_ID: 4 }, { global_ID: 9 } ],
					},
				}
			)
		).to.deep.equal( {
			'1-1-all': [ 3, 4, 9 ],
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
					},
				}
			)
		).to.deep.equal( {
			'1-1-all': true,
		} );
	} );

	test( 'request success should unset the flag', () => {
		expect(
			queuedRequests(
				{
					'1-1-all': true,
				},
				{
					type: READER_RELATED_POSTS_REQUEST_SUCCESS,
					payload: {
						siteId: 1,
						postId: 1,
					},
				}
			)
		).to.deep.equal( {
			'1-1-all': false,
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
					},
				}
			)
		).to.deep.equal( {
			'1-1-all': false,
		} );
	} );
} );
