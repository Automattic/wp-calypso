/**
 * External dependencies
 */
import { expect } from 'chai';
import { translate } from 'i18n-calypso';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice } from 'state/notices/actions';
import { requestZoneFeed, requestZoneFeedError, updateZoneFeed } from '../';
import { fromApi } from '../util';
import { updateFeed } from 'zoninator/state/feeds/actions';

const dummyAction = {
	type: 'DUMMY_ACTION',
	siteId: 123,
	zoneId: 456,
};

const apiResponse = [
	{ ID: 1 },
	{ ID: 2 },
	{ ID: 3 },
];

describe( '#requestZoneFeed()', () => {
	it( 'should dispatch a HTTP request to the feed endpoint', () => {
		const dispatch = sinon.spy();

		requestZoneFeed( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith( http( {
			method: 'GET',
			path: '/jetpack-blogs/123/rest-api/',
			query: {
				path: '/zoninator/v1/zones/456'
			},
		}, dummyAction ) );
	} );

	it( 'should dispatch `removeNotice`', () => {
		const dispatch = sinon.spy();

		requestZoneFeed( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledWith( removeNotice( 'zoninator-request-feed' ) );
	} );
} );

describe( '#requestZoneFeedError()', () => {
	it( 'should dispatch `errorNotice`', () => {
		const dispatch = sinon.spy();

		requestZoneFeedError( { dispatch }, dummyAction );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( errorNotice(
			translate( 'There was a problem while fetching the zone post feed.' ),
			{ id: 'zoninator-request-feed' },
		) );
	} );
} );

describe( '#updateZoneFeed()', () => {
	it( 'should dispatch `updateFeed`', () => {
		const dispatch = sinon.spy();

		updateZoneFeed( { dispatch }, dummyAction, { data: apiResponse } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( updateFeed( 123, 456, fromApi( apiResponse ) ) );
	} );
} );
