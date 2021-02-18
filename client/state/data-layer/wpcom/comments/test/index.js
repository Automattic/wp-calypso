/**
 * Internal dependencies
 */
import {
	fetchPostComments,
	addComments,
	announceFailure,
	commentsFromApi,
	handleDeleteSuccess,
} from '../';
import {
	COMMENTS_RECEIVE,
	COMMENTS_UPDATES_RECEIVE,
	COMMENTS_COUNT_RECEIVE,
	NOTICE_CREATE,
} from 'calypso/state/action-types';
import { NUMBER_OF_COMMENTS_PER_FETCH } from 'calypso/state/comments/constants';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'post comments request', () => {
		describe( '#fetchPostComments()', () => {
			test( 'should dispatch an HTTP request to the post replies endpoint', () => {
				const query = {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash',
				};
				const action = {
					type: 'DUMMY_ACTION',
					siteId: '2916284',
					postId: '1010',
					query,
				};
				const dispatch = jest.fn();
				const getState = () => ( {
					comments: {
						items: {
							'2916284-1010': [],
						},
					},
				} );

				fetchPostComments( action )( dispatch, getState );

				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/sites/2916284/posts/1010/replies',
							query,
						},
						action
					)
				);
			} );

			test( 'should dispatch an HTTP request to the post replies endpoint, before the oldest contiguous comment in state', () => {
				const query = {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash',
				};
				const action = {
					type: 'DUMMY_ACTION',
					siteId: '2916284',
					postId: '1010',
					query,
					direction: 'before',
				};
				const dispatch = jest.fn();
				const getState = () => ( {
					comments: {
						items: {
							'2916284-1010': [
								{ id: 0, date: '2015-05-25T21:41:25.841Z', contiguous: false },
								{ id: 1, date: '2017-05-25T21:41:25.841Z', contiguous: true },
								{ id: 2, date: '2017-05-25T20:41:25.841Z', contiguous: true },
								{ id: 3, date: '2017-05-25T19:41:25.841Z', contiguous: true },
							],
						},
					},
				} );

				fetchPostComments( action )( dispatch, getState );

				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/sites/2916284/posts/1010/replies',
							query: {
								...query,
								before: '2017-05-25T19:41:25.841Z',
							},
						},
						action
					)
				);
			} );
		} );

		describe( '#addComments', () => {
			test( 'should dispatch a comments receive action', () => {
				const action = {
					siteId: 2916284,
					postId: 1010,
					direction: 'before',
				};
				const data = {
					comments: [],
					found: -1,
				};

				expect( addComments( action, data ) ).toEqual( {
					type: COMMENTS_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					comments: [],
					direction: 'before',
				} );
			} );

			test( 'should dispatch a comments receive action and a count receive action when comments found', () => {
				const action = {
					siteId: 2916284,
					postId: 1010,
					direction: 'before',
				};
				const data = {
					comments: [ {}, {} ],
					found: 2,
				};

				expect( addComments( action, data ) ).toContainEqual( {
					type: COMMENTS_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					comments: [ {}, {} ],
					direction: 'before',
				} );

				expect( addComments( action, data ) ).toContainEqual( {
					type: COMMENTS_COUNT_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					totalCommentsCount: 2,
				} );
			} );

			test( 'should dispatch a comments updates receive action if isPoll is true', () => {
				const action = {
					siteId: 2916284,
					postId: 1010,
					direction: 'after',
					isPoll: true,
				};
				const data = {
					comments: [ {}, {} ],
					found: 2,
				};

				expect( addComments( action, data ) ).toContainEqual( {
					type: COMMENTS_UPDATES_RECEIVE,
					siteId: 2916284,
					postId: 1010,
					comments: [ {}, {} ],
					direction: 'after',
				} );
			} );
		} );

		describe( 'commentsFromApi', () => {
			test( 'should decode author name entities', () => {
				const comments = [ { author: { name: 'joe' } }, { author: { name: '&#9829;' } } ];
				expect( commentsFromApi( comments ) ).toEqual( [
					{ author: { name: 'joe' } },
					{ author: { name: '♥' } },
				] );
			} );
		} );

		describe( '#announceFailure', () => {
			test( 'should dispatch an error notice', () => {
				const dispatch = jest.fn();
				const getState = () => ( {
					posts: {
						queries: {},
					},
				} );

				announceFailure( { siteId: 2916284, postId: 1010 } )( dispatch, getState );

				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: NOTICE_CREATE,
						notice: expect.objectContaining( {
							status: 'is-error',
							text: 'Could not retrieve comments for post',
							duration: 5000,
						} ),
					} )
				);
			} );
		} );

		describe( '#handleDeleteSuccess', () => {
			test( 'should not do anything when no options are set', () => {
				expect( handleDeleteSuccess( {} ) ).toEqual( [] );
			} );

			test( 'should show a success notice if the related option is set', () => {
				expect( handleDeleteSuccess( { options: { showSuccessNotice: true } } ) ).toContainEqual( {
					type: NOTICE_CREATE,
					notice: expect.objectContaining( {
						status: 'is-success',
						text: 'Comment deleted permanently.',
					} ),
				} );
			} );

			test( 'should request a fresh copy of a comments page when the query object is filled', () => {
				expect(
					handleDeleteSuccess( {
						options: { showSuccessNotice: true },
						refreshCommentListQuery: {
							listType: 'site',
							number: 20,
							page: 1,
							siteId: 12345678,
							status: 'all',
							type: 'any',
						},
					} )
				).toContainEqual( {
					type: 'COMMENTS_LIST_REQUEST',
					query: {
						listType: 'site',
						number: 20,
						page: 1,
						siteId: 12345678,
						status: 'all',
						type: 'any',
					},
				} );
			} );
		} );
	} );
} );
