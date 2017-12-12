/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { fetchPostRevisionsDiffs, receiveSuccess, receiveError } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receivePostRevisions,
	receivePostRevisionsSuccess,
	receivePostRevisionsFailure,
	requestPostRevisions,
} from 'state/posts/revisions/actions';

const successfulPostRevisionsDiffsResponse = {
	diffs: [
		{
			from: 5,
			to: 6,
			diff: {
				post_content: [ { op: 'add', value: 'Things and ' }, { op: 'copy', value: 'stuff' } ],
				post_title: [ { op: 'copy', value: 'A REALLY big fan of yours' } ],
			},
		},
		{
			from: 4,
			to: 5,
			diff: {
				post_content: [ { op: 'copy', value: 'stuff' } ],
				post_title: [
					{ op: 'copy', value: 'A ' },
					{ op: 'add', value: 'REALLY ' },
					{ op: 'copy', value: 'big fan of yours' },
				],
			},
		},
	],
	revisions: [
		{
			id: 6,
			post_author: '99999',
			post_content: 'Things and stuff',
			post_date_gmt: '2017-11-29 23:13:43Z',
			post_excerpt: '',
			post_modified_gmt: '2017-11-29 23:13:43Z',
			post_title: 'A REALLY big fan of yours! :)',
		},
		{
			id: 5,
			post_author: '99999',
			post_content: 'stuff',
			post_date_gmt: '2017-11-29 21:12:41Z',
			post_excerpt: '',
			post_modified_gmt: '2017-11-29 21:12:41Z',
			post_title: 'A REALLY big fan of yours! :)',
		},
		{
			id: 4,
			post_author: '99999',
			post_content: 'stuff',
			post_date_gmt: '2017-11-28 22:12:42Z',
			post_excerpt: '',
			post_modified_gmt: '2017-11-28 22:12:42Z',
			post_title: 'A big fan of yours! :)',
		},
	],
};

describe( '#fetchPostRevisionsDiffs', () => {
	test( 'should dispatch HTTP request to post revisions diffs endpoint', () => {
		const action = requestPostRevisions( 12345678, 10, 'post' );
		const dispatch = sinon.spy();

		fetchPostRevisionsDiffs( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					apiVersion: '1.1',
					method: 'GET',
					path: '/sites/12345678/post/10/diffs',
					query: {
						comparisons: [],
					},
				},
				action
			)
		);
	} );

	test( 'should dispatch HTTP request to page diffs endpoint for pages', () => {
		const action = requestPostRevisions( 12345678, 10, 'page' );
		const dispatch = sinon.spy();

		fetchPostRevisionsDiffs( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					apiVersion: '1.1',
					method: 'GET',
					path: '/sites/12345678/page/10/diffs',
					query: {
						comparisons: [],
					},
				},
				action
			)
		);
	} );

	test( 'should dispatch HTTP request to post diffs endpoint for other post types', () => {
		const action = requestPostRevisions( 12345678, 10, 'jetpack-portfolio' );
		const dispatch = sinon.spy();

		fetchPostRevisionsDiffs( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					apiVersion: '1.1',
					method: 'GET',
					path: '/sites/12345678/jetpack-portfolio/10/diffs',
					query: {
						comparisons: [],
					},
				},
				action
			)
		);
	} );
} );

describe( '#receiveSuccess', () => {
	test( 'should dispatch `receivePostRevisions` and `receivePostRevisionsSuccess`', () => {
		const action = requestPostRevisions( 12345678, 10, 'post' );
		const dispatch = sinon.spy();

		receiveSuccess( { dispatch }, action, successfulPostRevisionsDiffsResponse );

		expect( dispatch ).to.have.callCount( 2 );
		expect( dispatch ).to.have.been.calledWith( receivePostRevisionsSuccess( 12345678, 10 ) );
		expect( dispatch ).to.have.been.calledWith(
			receivePostRevisions( {
				siteId: 12345678,
				postId: 10,
				...successfulPostRevisionsDiffsResponse,
			} )
		);
	} );
} );

describe( '#receiveError', () => {
	test( 'should dispatch `receivePostRevisionsFailure`', () => {
		const action = requestPostRevisions( 12345678, 10 );
		const dispatch = sinon.spy();
		const rawError = new Error( 'Foo Bar' );

		receiveError( { dispatch }, action, rawError );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			receivePostRevisionsFailure( 12345678, 10, rawError )
		);
	} );
} );
