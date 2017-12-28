/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { translate } from 'i18n-calypso';
import { initialize, startSubmit, stopSubmit } from 'redux-form';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	announceSuccess,
	announceFailure,
	requestZoneFeed,
	requestZoneFeedError,
	saveZoneFeed,
	updateZoneFeed,
} from '../';
import { fromApi, toApi } from '../util';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice, successNotice } from 'client/state/notices/actions';
import { updateFeed } from 'client/extensions/zoninator/state/feeds/actions';

const dummyAction = {
	type: 'DUMMY_ACTION',
	form: 'test-form',
	siteId: 123,
	zoneId: 456,
	posts: [ { ID: 1, title: 'A test post' }, { ID: 2, title: 'Another test post' } ],
};

const apiResponse = [
	{ ID: 1, title: 'Test one', guid: 'http://my.blog/test-one' },
	{ ID: 2, title: 'Test two', guid: 'http://my.blog/test-two' },
];

const getState = () => ( {
	extensions: {
		zoninator: {
			zones: {
				items: {
					[ dummyAction.siteId ]: {
						[ dummyAction.zoneId ]: {
							name: 'Test zone',
						},
					},
				},
			},
		},
	},
} );

describe( '#requestZoneFeed()', () => {
	test( 'should dispatch a HTTP request to the feed endpoint', () => {
		const dispatch = sinon.spy();

		requestZoneFeed( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					method: 'GET',
					path: '/jetpack-blogs/123/rest-api/',
					query: {
						path: '/zoninator/v1/zones/456/posts',
					},
				},
				dummyAction
			)
		);
	} );

	test( 'should dispatch `removeNotice`', () => {
		const dispatch = sinon.spy();

		requestZoneFeed( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith( removeNotice( 'zoninator-request-feed' ) );
	} );
} );

describe( '#requestZoneFeedError()', () => {
	test( 'should dispatch `errorNotice`', () => {
		const dispatch = sinon.spy();

		requestZoneFeedError( { dispatch, getState }, dummyAction );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			errorNotice(
				translate( 'Could not fetch the posts feed for %(name)s. Please try again.', {
					args: { name: 'Test zone' },
				} ),
				{ id: 'zoninator-request-feed' }
			)
		);
	} );
} );

describe( '#updateZoneFeed()', () => {
	test( 'should dispatch `updateFeed`', () => {
		const dispatch = sinon.spy();

		updateZoneFeed( { dispatch }, dummyAction, { data: apiResponse } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			updateFeed( 123, 456, fromApi( apiResponse, dummyAction.siteId ) )
		);
	} );
} );

describe( '#saveZoneFeed()', () => {
	test( 'should dispatch a HTTP request to the feed endpoint', () => {
		const dispatch = sinon.spy();

		saveZoneFeed( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					method: 'POST',
					path: '/jetpack-blogs/123/rest-api/',
					query: {
						body: JSON.stringify( toApi( dummyAction.posts ) ),
						json: true,
						path: '/zoninator/v1/zones/456/posts&_method=PUT',
					},
				},
				dummyAction
			)
		);
	} );

	test( 'should dispatch `removeNotice`', () => {
		const dispatch = sinon.spy();

		saveZoneFeed( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith( removeNotice( 'zoninator-save-feed' ) );
	} );

	test( 'should dispatch `startSubmit`', () => {
		const dispatch = sinon.spy();

		saveZoneFeed( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith( startSubmit( dummyAction.form ) );
	} );
} );

describe( '#announceSuccess()', () => {
	test( 'should dispatch `stopSubmit`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith( stopSubmit( dummyAction.form ) );
	} );

	test( 'should dispatch `initialize`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith(
			initialize( dummyAction.form, { posts: dummyAction.posts } )
		);
	} );

	test( 'should dispatch `successNotice`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith(
			successNotice( translate( 'Zone feed saved!' ), { id: 'zoninator-save-feed' } )
		);
	} );

	test( 'should dispatch `updateFeed`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith( updateFeed( 123, 456, dummyAction.posts ) );
	} );
} );

describe( '#announceFailure()', () => {
	test( 'should dispatch `stopSubmit`', () => {
		const dispatch = sinon.spy();

		announceFailure( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith( stopSubmit( dummyAction.form ) );
	} );

	test( 'should dispatch `errorNotice`', () => {
		const dispatch = sinon.spy();

		announceFailure( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith(
			errorNotice( translate( 'There was a problem saving your changes. Please try again' ), {
				id: 'zoninator-save-feed',
			} )
		);
	} );
} );
