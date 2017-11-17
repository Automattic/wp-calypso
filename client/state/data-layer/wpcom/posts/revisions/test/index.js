/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { cloneDeep, map } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { fetchPostRevisions, normalizeRevision, receiveSuccess, receiveError } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receivePostRevisions,
	receivePostRevisionsSuccess,
	receivePostRevisionsFailure,
	requestPostRevisions,
} from 'state/posts/revisions/actions';

const successfulPostRevisionsResponse = [
	{
		author: 1,
		date: '2017-04-20T12:14:40',
		date_gmt: '2017-04-20T12:14:40',
		id: 11,
		modified: '2017-04-21T12:14:50',
		modified_gmt: '2017-04-21T12:14:50',
		parent: 10,
		title: {
			raw: 'Sed nobis ab earum',
		},
		content: {
			raw: '<p>Lorem ipsum</p>',
		},
		excerpt: {
			raw: '',
		},
	},
];

const normalizedPostRevisions = [
	{
		author: 1,
		date: '2017-04-20T12:14:40Z',
		id: 11,
		modified: '2017-04-21T12:14:50Z',
		parent: 10,
		title: 'Sed nobis ab earum',
		content: '<p>Lorem ipsum</p>',
		excerpt: '',
	},
];

describe( '#normalizeRevision', () => {
	test( 'should keep UTC dates formatted with a timezone marker (`Z`)', () => {
		expect(
			normalizeRevision( {
				date: '2017-04-20T12:14:40',
				date_gmt: '2017-04-20T12:14:40',
				modified: '2017-04-20T12:14:50',
				modified_gmt: '2017-04-20T12:14:50',
			} )
		).to.eql( {
			date: '2017-04-20T12:14:40Z',
			modified: '2017-04-20T12:14:50Z',
		} );
	} );

	test( 'should only keep the raw version of `title`, `content` and `excerpt`', () => {
		expect(
			normalizeRevision( {
				title: {
					raw: 'Sed nobis ab earum',
				},
				content: {
					raw: '<p>Lorem ipsum</p>',
				},
				excerpt: {
					raw: '',
				},
			} )
		).to.eql( {
			title: 'Sed nobis ab earum',
			content: '<p>Lorem ipsum</p>',
			excerpt: '',
		} );
	} );

	test( 'should not have any additional property', () => {
		expect( map( successfulPostRevisionsResponse, normalizeRevision ) ).to.eql(
			normalizedPostRevisions
		);
	} );
} );

describe( '#fetchPostRevisions', () => {
	test( 'should dispatch HTTP request to post revisions endpoint', () => {
		const action = requestPostRevisions( 12345678, 10 );
		const dispatch = sinon.spy();

		fetchPostRevisions( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					method: 'GET',
					path: '/sites/12345678/posts/10/revisions',
					query: {
						apiNamespace: 'wp/v2',
						context: 'edit',
					},
				},
				action
			)
		);
	} );

	test( 'should dispatch HTTP request to page revisions endpoint', () => {
		const action = requestPostRevisions( 12345678, 10, 'page' );
		const dispatch = sinon.spy();

		fetchPostRevisions( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					method: 'GET',
					path: '/sites/12345678/pages/10/revisions',
					query: {
						apiNamespace: 'wp/v2',
						context: 'edit',
					},
				},
				action
			)
		);
	} );
} );

describe( '#receiveSuccess', () => {
	test( 'should normalize the revisions and dispatch `receivePostRevisions` and `receivePostRevisionsSuccess`', () => {
		const action = requestPostRevisions( 12345678, 10 );
		const dispatch = sinon.spy();

		receiveSuccess( { dispatch }, action, successfulPostRevisionsResponse );

		const expectedRevisions = cloneDeep( normalizedPostRevisions );

		expect( dispatch ).to.have.callCount( 2 );
		expect( dispatch ).to.have.been.calledWith( receivePostRevisionsSuccess( 12345678, 10 ) );
		expect( dispatch ).to.have.been.calledWith(
			receivePostRevisions( 12345678, 10, expectedRevisions )
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
