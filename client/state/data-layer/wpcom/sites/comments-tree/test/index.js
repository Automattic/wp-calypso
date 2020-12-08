/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { fetchCommentsTreeForSite, addCommentsTree, announceFailure } from '../';
import { COMMENTS_TREE_SITE_ADD, NOTICE_CREATE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'comments-tree', () => {
	const action = { type: 'DUMMY_ACTION', query: { status: 'approved', siteId: 77203074 } };

	describe( 'fetchCommentsTreeForSite()', () => {
		test( 'should dispatch HTTP request to comments-tree endpoint', () => {
			fetchCommentsTreeForSite( action );
			expect( fetchCommentsTreeForSite( action ) ).toEqual(
				http(
					{
						method: 'GET',
						path: '/sites/77203074/comments-tree',
						query: { status: 'approved' },
						apiVersion: '1.1',
					},
					action
				)
			);
		} );
	} );

	describe( 'addCommentsTree', () => {
		test( 'should dispatch comment tree updates', () => {
			const result = addCommentsTree( action, {
				comments_tree: { 1: [ [ 2 ], [] ] },
				pingbacks_tree: { 1: [ [ 3 ], [] ] },
				trackbacks_tree: { 1: [ [ 4 ], [] ] },
			} );
			expect( result ).toEqual( {
				type: COMMENTS_TREE_SITE_ADD,
				siteId: 77203074,
				status: 'approved',
				tree: [
					{
						commentId: 2,
						postId: 1,
						commentParentId: 0,
						status: 'approved',
						type: 'comment',
					},
					{
						commentId: 3,
						postId: 1,
						commentParentId: 0,
						status: 'approved',
						type: 'pingback',
					},
					{
						commentId: 4,
						postId: 1,
						commentParentId: 0,
						status: 'approved',
						type: 'trackback',
					},
				],
			} );
		} );
	} );

	describe( 'announceFailure', () => {
		test( 'should dispatch an error notice', () => {
			const dispatch = jest.fn();
			const getState = () => ( { sites: { items: [] } } );
			announceFailure( action )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( expect.objectContaining( { type: NOTICE_CREATE } ) );
		} );
	} );
} );
