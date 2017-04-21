/**
 * External dependencies
 */
import { expect } from 'chai';
import { map } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	fetchPostRevisions,
	normalizeRevision,
	receiveSuccess,
	receiveError,
} from '../';
import {
	receivePostRevisions,
	receivePostRevisionsSuccess,
	receivePostRevisionsFailure,
	requestPostRevisions,
} from 'state/posts/revisions/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

const successfulPostRevisionsResponse = [
	{
		author: 1,
		date: '2017-04-20T12:14:40',
		date_gmt: '2017-04-20T12:14:40',
		id: 11,
		modified: '2017-04-21T12:14:40',
		modified_gmt: '2017-04-21T12:14:40',
		parent: 10,
		title: {
			rendered: 'Sed nobis ab earum',
		},
		content: {
			rendered: '<p>Lorem ipsum</p>',
		},
		excerpt: {
			rendered: '',
		},
	},
];

const normalizedPostRevisions = [
	{
		author: 1,
		date: '2017-04-20T12:14:40',
		date_gmt: '2017-04-20T12:14:40',
		id: 11,
		modified: '2017-04-21T12:14:40',
		modified_gmt: '2017-04-21T12:14:40',
		parent: 10,
		title: 'Sed nobis ab earum',
		content: '<p>Lorem ipsum</p>',
		excerpt: '',
	},
];

describe( '#normalizeRevision', () => {
	it( 'should only keep the rendered version of `title`, `content` and `excerpt`', () => {
		expect(
			map( successfulPostRevisionsResponse, normalizeRevision )
		).to.eql( normalizedPostRevisions );
	} );
} );

describe( '#fetchPostRevisions', () => {
	it( 'should dispatch HTTP request to tag endpoint', () => {
		const action = requestPostRevisions( 12345678, 10 );
		const dispatch = sinon.spy();
		const next = sinon.spy();

		fetchPostRevisions( { dispatch }, action, next );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			method: 'GET',
			path: '/sites/12345678/posts/10/revisions',
			query: {
				apiNamespace: 'wp/v2',
			},
		} ) );
	} );
} );

describe( '#receiveSuccess', () => {
	it( 'should normalize the revisions and dispatch `receivePostRevisions` and `receivePostRevisionsSuccess`', () => {
		const action = requestPostRevisions( 12345678, 10 );
		const dispatch = sinon.spy();
		const next = sinon.spy();

		receiveSuccess( { dispatch }, action, next, successfulPostRevisionsResponse );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith( receivePostRevisionsSuccess( 12345678, 10 ) );
		expect( dispatch ).to.have.been.calledWith( receivePostRevisions( 12345678, 10, normalizedPostRevisions ) );
	} );
} );

describe( '#receiveError', () => {
	it( 'should dispatch `receivePostRevisionsFailure`', () => {
		const action = requestPostRevisions( 12345678, 10 );
		const dispatch = sinon.spy();
		const next = sinon.spy();
		const rawError = new Error( 'Foo Bar' );

		receiveError( { dispatch }, action, next, rawError );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( receivePostRevisionsFailure( 12345678, 10, rawError ) );
	} );
} );
