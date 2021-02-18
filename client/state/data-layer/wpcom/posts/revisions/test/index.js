/**
 * Internal dependencies
 */
import { fetchPostRevisionsDiffs, receiveSuccess } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { receivePostRevisions, requestPostRevisions } from 'calypso/state/posts/revisions/actions';

const successfulPostRevisionsDiffsResponse = {
	diffs: [
		{
			from: 5,
			to: 6,
			diff: {
				post_content: [
					{ op: 'add', value: 'Things and ' },
					{ op: 'copy', value: 'stuff' },
				],
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

		expect( fetchPostRevisionsDiffs( action ) ).toMatchObject(
			http(
				{
					apiVersion: '1.2',
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

		expect( fetchPostRevisionsDiffs( action ) ).toMatchObject(
			http(
				{
					apiVersion: '1.2',
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

		expect( fetchPostRevisionsDiffs( action ) ).toMatchObject(
			http(
				{
					apiVersion: '1.2',
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

		expect( receiveSuccess( action, successfulPostRevisionsDiffsResponse ) ).toEqual(
			receivePostRevisions( {
				siteId: 12345678,
				postId: 10,
				...successfulPostRevisionsDiffsResponse,
			} )
		);
	} );
} );
