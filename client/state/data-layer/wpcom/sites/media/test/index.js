/**
 * Internal dependencies
 */
import {
	requestMediaItem,
	receiveMediaItem,
	receiveMediaItemError,
	requestMedia,
	requestMediaError,
	requestMediaSuccess,
} from '../';
import { MEDIA_ITEM_REQUEST } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	failMediaItemRequest,
	failMediaRequest,
	receiveMedia,
	setNextPageHandle,
	successMediaItemRequest,
	successMediaRequest,
} from 'calypso/state/media/actions';

describe( 'media request', () => {
	test( 'should dispatch SUCCESS action when request completes', () => {
		const dispatch = jest.fn();
		const getState = jest.fn( () => ( {
			media: {
				fetching: {
					2916284: {
						query: {
							mime_type: 'image/',
						},
					},
				},
			},
		} ) );

		const meta = Symbol( 'media request meta' );

		const query = { number: 20, mime_type: 'image/' };

		requestMediaSuccess(
			{ siteId: 2916284, query },
			{ media: { ID: 10, title: 'media title' }, found: true, meta }
		)( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledWith( successMediaRequest( 2916284, query ) );
		expect( dispatch ).toHaveBeenCalledWith(
			receiveMedia( 2916284, { ID: 10, title: 'media title' }, true, query )
		);
		expect( dispatch ).toHaveBeenCalledWith( setNextPageHandle( 2916284, meta ) );
	} );

	test( 'should dispatch FAILURE action when request fails', () => {
		const result = requestMediaError( { siteId: 2916284, query: 'a=b' } );

		expect( result ).toEqual( failMediaRequest( 2916284, 'a=b' ) );
	} );

	test( 'should dispatch http request', () => {
		expect( requestMedia( { siteId: 2916284, query: 'a=b' } ) ).toEqual(
			expect.arrayContaining( [
				http(
					{
						method: 'GET',
						path: '/sites/2916284/media',
						apiVersion: '1.1',
						query: 'a=b',
					},
					{ siteId: 2916284, query: 'a=b' }
				),
			] )
		);
	} );
} );

describe( 'requestMediaItem', () => {
	test( 'should dispatch an http action', () => {
		const siteId = 12345;
		const mediaId = 67890;
		const action = {
			type: MEDIA_ITEM_REQUEST,
			mediaId,
			siteId,
		};
		expect( requestMediaItem( action ) ).toEqual(
			expect.arrayContaining( [
				http(
					{
						apiVersion: '1.2',
						method: 'GET',
						path: `/sites/${ siteId }/media/${ mediaId }`,
					},
					action
				),
			] )
		);
	} );
} );

describe( 'receiveMediaItem', () => {
	test( 'should dispatch media recieve actions', () => {
		const siteId = 12345;
		const mediaId = 67890;
		const action = {
			type: MEDIA_ITEM_REQUEST,
			mediaId,
			siteId,
		};
		const media = { ID: 91827364 };

		const result = receiveMediaItem( action, media );

		expect( result ).toEqual( [
			receiveMedia( siteId, media ),
			successMediaItemRequest( siteId, mediaId ),
		] );
	} );
} );

describe( 'receiveMediaItemError', () => {
	test( 'should return a failure action', () => {
		const siteId = 12345;
		const mediaId = 67890;
		const action = {
			type: MEDIA_ITEM_REQUEST,
			mediaId,
			siteId,
		};

		const result = receiveMediaItemError( action );

		expect( result ).toEqual( failMediaItemRequest( siteId, mediaId ) );
	} );
} );
