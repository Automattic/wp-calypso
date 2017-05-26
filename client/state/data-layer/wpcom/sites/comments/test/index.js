/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { addComments, fetchCommentsList } from '../';

const query = {
	siteId: 1337,
	status: 'unapproved',
	type: 'comment',
};

describe( '#addComments', () => {
	let dispatch;

	beforeEach( () => dispatch = spy() );

	it( 'should dispatch no actions for no comments', () => {
		addComments( { dispatch }, { query }, null, { comments: [] } );

		expect( dispatch ).to.have.not.been.called;
	} );

	it( 'should dispatch to add received comments into state', () => {
		const comments = [
			{ ID: 5, post: { ID: 1 } },
			{ ID: 6, post: { ID: 1 } },
		];

		addComments( { dispatch }, { query }, null, { comments } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch.lastCall ).to.have.been.calledWith( {
			type: 'COMMENTS_RECEIVE',
			siteId: query.siteId,
			postId: 1,
			comments,
		} );
	} );

	it( 'should dispatch received comments into separate actions per post', () => {
		const comments = [
			{ ID: 5, post: { ID: 1 } },
			{ ID: 6, post: { ID: 2 } },
			{ ID: 2, post: { ID: 1 } },
		];

		addComments( { dispatch }, { query }, null, { comments } );

		expect( dispatch ).to.have.been.calledTwice;

		expect( dispatch ).to.have.been.calledWithMatch( {
			postId: 1,
			comments: [ comments[ 0 ], comments[ 2 ] ],
		} );

		expect( dispatch ).to.have.been.calledWithMatch( {
			postId: 2,
			comments: [ comments[ 1 ] ],
		} );
	} );
} );

describe( '#fetchCommentList', () => {
	let dispatch;

	beforeEach( () => dispatch = spy() );

	it( 'should do nothing if no listType provided', () => {
		fetchCommentsList( { dispatch }, { query } );

		expect( dispatch ).to.have.not.been.called;
	} );

	it( 'should do nothing if invalid listType provided', () => {
		fetchCommentsList( { dispatch }, { query: { ...query, listType: 'Calypso' } } );

		expect( dispatch ).to.have.not.been.called;
	} );

	it( 'should dispatch HTTP request for site comments', () => {
		fetchCommentsList( { dispatch }, { query: { ...query, listType: 'site' } } );

		expect( dispatch ).to.have.been.calledWithMatch( {
			type: 'WPCOM_HTTP_REQUEST',
			path: '/sites/1337/comments',
		} );
	} );

	it( 'should default to fetch pending comments', () => {
		fetchCommentsList( { dispatch }, { query: { listType: 'site', siteId: 1337 } } );

		expect( dispatch ).to.have.been.calledWithMatch( { query: { status: 'unapproved' } } );
	} );

	it( 'should default to fetch comment-type comments', () => {
		fetchCommentsList( { dispatch }, { query: { listType: 'site', siteId: 1337 } } );

		expect( dispatch ).to.have.been.calledWithMatch( { query: { type: 'comment' } } );
	} );
} );
