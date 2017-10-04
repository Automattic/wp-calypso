/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon, { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchCommentsTreeForSite, addCommentsTree, announceFailure } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { COMMENTS_TREE_SITE_ADD, NOTICE_CREATE } from 'state/action-types';

describe( 'comments-tree', () => {
	const action = { type: 'DUMMY_ACTION', query: { status: 'approved', siteId: 77203074 } };

	describe( 'fetchCommentsTreeForSite()', () => {
		it( 'should dispatch HTTP request to comments-tree endpoint', () => {
			const dispatch = spy();
			fetchCommentsTreeForSite( { dispatch }, action );
			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						method: 'GET',
						path: '/sites/77203074/comments-tree',
						query: { status: 'approved' },
						apiVersion: '1',
					},
					action
				)
			);
		} );
	} );

	describe( 'addCommentsTree', () => {
		it( 'should dispatch comment tree updates', () => {
			const dispatch = spy();
			addCommentsTree( { dispatch }, action, {
				comments_tree: [ [ 2, 1, 0 ] ],
				pingbacks_tree: [ [ 3, 1, 0 ] ],
				trackbacks_tree: [ [ 4, 1, 0 ] ],
			} );
			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( {
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
		it( 'should dispatch an error notice', () => {
			const dispatch = spy();
			announceFailure( { dispatch, getState: () => ( { sites: { items: [] } } ) }, action );
			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( sinon.match( { type: NOTICE_CREATE } ) );
		} );
	} );
} );
