/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_REMOVE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_REQUEST_SUCCESS
} from 'state/action-types';
import { items } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		describe( 'request post comments', () => {
			it( 'should default to an empty object', () => {
				const state = items( undefined, {} );
				expect( state ).to.eql( {} );
			} );

			it( 'should add query results to a previous state that already has comments for a blog', () => {
				const action = {
					type: DISCUSSIONS_REQUEST_SUCCESS,
					siteId: 101010,
					postId: 202020,
					status: 'all',
					comments: [
						{ ID: 2, content: 'lorem ipsum' },
						{ ID: 3, content: 'lorem ipsum' },
						{ ID: 4, content: 'lorem ipsum' }
					]
				};

				const previousState = {
					101010: {
						1: { ID: 1, content: 'lorem ipsum' }
					}
				};

				const state = items( previousState, action );

				expect( state ).to.eql( {
					101010: {
						1: { ID: 1, content: 'lorem ipsum' },
						2: { ID: 2, content: 'lorem ipsum' },
						3: { ID: 3, content: 'lorem ipsum' },
						4: { ID: 4, content: 'lorem ipsum' }
					}
				} );
			} );
		} );

		describe( 'like post comment', () => {
			it( 'should update the like status and count of a comment', () => {
				const prevState = {
					101010: {
						1: { ID: 1, iLike: false, likeCount: 1 },
						2: { ID: 2, iLike: false, likeCount: 1 },
						3: { ID: 3, iLike: false, likeCount: 1 },
						4: { ID: 4, iLike: false, likeCount: 1 }
					}
				};

				const action = {
					type: DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
					siteId: 101010,
					postId: 202020,
					commentId: 3,
					iLike: true,
					likeCount: 4
				};

				const state = items( prevState, action );

				expect( state ).to.eql( {
					101010: {
						1: { ID: 1, iLike: false, likeCount: 1 },
						2: { ID: 2, iLike: false, likeCount: 1 },
						3: { ID: 3, iLike: true, likeCount: 4 },
						4: { ID: 4, iLike: false, likeCount: 1 }
					}
				} );
			} );
		} );

		describe( 'unlike post comment', () => {
			it( 'should update the like status and count of a comment', () => {
				const prevState = {
					101010: {
						1: { ID: 1, iLike: true, likeCount: 10 },
						2: { ID: 2, iLike: true, likeCount: 10 },
						3: { ID: 3, iLike: true, likeCount: 10 },
						4: { ID: 4, iLike: true, likeCount: 10 }
					}
				};

				const action = {
					type: DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
					siteId: 101010,
					postId: 202020,
					commentId: 3,
					iLike: false,
					likeCount: 4
				};

				const state = items( prevState, action );

				expect( state ).to.eql( {
					101010: {
						1: { ID: 1, iLike: true, likeCount: 10 },
						2: { ID: 2, iLike: true, likeCount: 10 },
						3: { ID: 3, iLike: false, likeCount: 4 },
						4: { ID: 4, iLike: true, likeCount: 10 }
					}
				} );
			} );
		} );

		describe( 'change comment status', () => {
			it( 'should update the status of a comment', () => {
				const prevState = {
					101010: {
						1: { ID: 1, status: 'approved' },
						2: { ID: 2, status: 'approved' },
						3: { ID: 3, status: 'approved' },
						4: { ID: 4, status: 'approved' }
					}
				};

				const action = {
					type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
					siteId: 101010,
					commentId: 3,
					status: 'unapproved'
				};

				const state = items( prevState, action );

				expect( state ).to.eql( {
					101010: {
						1: { ID: 1, status: 'approved' },
						2: { ID: 2, status: 'approved' },
						3: { ID: 3, status: 'unapproved' },
						4: { ID: 4, status: 'approved' }
					}
				} );
			} );
		} );

		describe( 'update comment content', () => {
			it( 'should update the content of a comment', () => {
				const prevState = {
					101010: {
						1: { ID: 1, content: 'lorem ipsum' },
						2: { ID: 2, content: 'lorem ipsum' },
						3: { ID: 3, content: 'lorem ipsum' },
						4: { ID: 4, content: 'lorem ipsum' }
					}
				};

				const action = {
					type: DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_SUCCESS,
					siteId: 101010,
					commentId: 3,
					content: 'dolor sit amet'
				};

				const state = items( prevState, action );

				expect( state ).to.eql( {
					101010: {
						1: { ID: 1, content: 'lorem ipsum' },
						2: { ID: 2, content: 'lorem ipsum' },
						3: { ID: 3, content: 'dolor sit amet' },
						4: { ID: 4, content: 'lorem ipsum' }
					}
				} );
			} );
		} );

		describe( 'remove comment', () => {
			it( 'should remove a comment by if from a site', () => {
				const prevState = {
					101010: {
						1: { ID: 1 },
						2: { ID: 2 },
						3: { ID: 3 },
						4: { ID: 4 }
					}
				};

				const action = {
					type: DISCUSSIONS_ITEM_REMOVE,
					siteId: 101010,
					commentId: 3
				};

				const state = items( prevState, action );

				expect( state ).to.eql( {
					101010: {
						1: { ID: 1 },
						2: { ID: 2 },
						4: { ID: 4 }
					}
				} );
			} );
		} );
	} );
} );
