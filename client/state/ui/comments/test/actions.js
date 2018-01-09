/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { COMMENTS_PROGRESS_UPDATE, COMMENTS_QUERY_UPDATE } from 'state/action-types';
import { updateCommentsProgress, updateCommentsQuery } from 'state/ui/comments/actions';

describe( 'actions', () => {
	describe( '#updateCommentsProgress()', () => {
		test( 'should return an update comments progress action', () => {
			const siteId = 12345678;
			const progressId = 'abcd-1234-defg-5678';
			const action = updateCommentsProgress( siteId, progressId );

			expect( action ).to.eql( {
				type: COMMENTS_PROGRESS_UPDATE,
				siteId,
				progressId,
				options: { failed: false },
			} );
		} );
	} );
	describe( '#updateCommentsQuery()', () => {
		test( 'should return an update comments pagination action', () => {
			const siteId = 12345678;
			const postId = 1234;
			const comments = [ { ID: 1 }, { ID: 2 }, { ID: 3 }, { ID: 4 }, { ID: 5 } ];
			const query = {
				order: 'DESC',
				page: 1,
				postId: postId,
				search: 'foo',
				status: 'all',
			};

			const action = updateCommentsQuery( siteId, comments, query );

			expect( action ).to.eql( {
				type: COMMENTS_QUERY_UPDATE,
				siteId,
				comments,
				query,
			} );
		} );
	} );
} );
