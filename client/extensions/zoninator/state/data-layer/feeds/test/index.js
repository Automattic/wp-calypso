/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { initialize, startSubmit, stopSubmit } from 'redux-form';
import { omit } from 'lodash';

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
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { updateFeed } from 'zoninator/state/feeds/actions';
import { resetLock } from 'zoninator/state/locks/actions';

import 'calypso/state/form/init';

const dummyAction = {
	type: 'DUMMY_ACTION',
	form: 'test-form',
	siteId: 123,
	zoneId: 456,
	posts: [
		{ ID: 1, title: 'A test post' },
		{ ID: 2, title: 'Another test post' },
	],
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
	test( 'should return a HTTP request to the feed endpoint', () => {
		expect( requestZoneFeed( dummyAction ) ).toContainEqual(
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

	test( 'should return `removeNotice`', () => {
		expect( requestZoneFeed( dummyAction ) ).toContainEqual(
			removeNotice( 'zoninator-request-feed' )
		);
	} );
} );

describe( '#requestZoneFeedError()', () => {
	test( 'should dispatch `errorNotice`', () => {
		const dispatch = jest.fn();

		requestZoneFeedError( dummyAction )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
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
	test( 'should return `updateFeed`', () => {
		expect( updateZoneFeed( dummyAction, { data: apiResponse } ) ).toEqual(
			updateFeed( 123, 456, fromApi( apiResponse, dummyAction.siteId ) )
		);
	} );
} );

describe( '#saveZoneFeed()', () => {
	test( 'should return a HTTP request to the feed endpoint', () => {
		expect( saveZoneFeed( dummyAction ) ).toContainEqual(
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

	test( 'should return `removeNotice`', () => {
		expect( saveZoneFeed( dummyAction ) ).toContainEqual( removeNotice( 'zoninator-save-feed' ) );
	} );

	test( 'should return `startSubmit`', () => {
		expect( saveZoneFeed( dummyAction ) ).toContainEqual( startSubmit( dummyAction.form ) );
	} );

	test( 'should return `resetLock`', () => {
		expect( saveZoneFeed( dummyAction ) ).toContainEqual(
			expect.objectContaining( omit( resetLock( 123, 456 ), [ 'time' ] ) )
		);
	} );
} );

describe( '#announceSuccess()', () => {
	test( 'should return `stopSubmit`', () => {
		expect( announceSuccess( dummyAction ) ).toContainEqual( stopSubmit( dummyAction.form ) );
	} );

	test( 'should return `initialize`', () => {
		expect( announceSuccess( dummyAction ) ).toContainEqual(
			initialize( dummyAction.form, { posts: dummyAction.posts } )
		);
	} );

	test( 'should return `successNotice`', () => {
		expect( announceSuccess( dummyAction ) ).toContainEqual(
			successNotice( translate( 'Zone feed saved!' ), { id: 'zoninator-save-feed' } )
		);
	} );

	test( 'should return `updateFeed`', () => {
		expect( announceSuccess( dummyAction ) ).toContainEqual(
			updateFeed( 123, 456, dummyAction.posts )
		);
	} );
} );

describe( '#announceFailure()', () => {
	test( 'should return `stopSubmit`', () => {
		expect( announceFailure( dummyAction ) ).toContainEqual( stopSubmit( dummyAction.form ) );
	} );

	test( 'should dispatch `errorNotice`', () => {
		expect( announceFailure( dummyAction ) ).toContainEqual(
			errorNotice( translate( 'There was a problem saving your changes. Please try again' ), {
				id: 'zoninator-save-feed',
			} )
		);
	} );
} );
