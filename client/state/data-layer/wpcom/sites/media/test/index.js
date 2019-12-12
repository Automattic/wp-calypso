/**
 * Internal dependencies
 */
import {
	handleMediaItemRequest,
	receiveMediaItem,
	receiveMediaItemError,
	requestMedia,
	requestMediaError,
	requestMediaSuccess,
} from '../';
import { MEDIA_ITEM_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	failMediaItemRequest,
	failMediaRequest,
	receiveMedia,
	requestingMedia,
	requestingMediaItem,
	successMediaItemRequest,
	successMediaRequest,
} from 'state/media/actions';

describe( 'media request', () => {
	test( 'should dispatch REQUESTING action when request triggers', () => {
		expect( requestMedia( { siteId: 2916284, query: 'a=b' } ) ).toEqual(
			expect.arrayContaining( [ requestingMedia( 2916284, 'a=b' ) ] )
		);
	} );

	test( 'should dispatch SUCCESS action when request completes', () => {
		expect(
			requestMediaSuccess(
				{ siteId: 2916284, query: 'a=b' },
				{ media: { ID: 10, title: 'media title' }, found: true }
			)
		).toEqual(
			expect.arrayContaining( [
				successMediaRequest( 2916284, 'a=b' ),
				receiveMedia( 2916284, { ID: 10, title: 'media title' }, true, 'a=b' ),
			] )
		);
	} );

	test( 'should dispatch FAILURE action when request fails', () => {
		expect( requestMediaError( { siteId: 2916284, query: 'a=b' } ) ).toEqual(
			failMediaRequest( 2916284, 'a=b' )
		);
	} );

	test( 'should dispatch http request', () => {
		expect( requestMedia( { siteId: 2916284, query: 'a=b' } ) ).toEqual(
			expect.arrayContaining( [
				http(
					{
						method: 'GET',
						path: '/sites/2916284/media',
						apiVersion: '1.1',
					},
					{ siteId: 2916284, query: 'a=b' }
				),
			] )
		);
	} );
} );

describe( 'handleMediaItemRequest', () => {
	test( 'should dispatch an http action', () => {
		const siteId = 12345;
		const mediaId = 67890;
		const action = {
			type: MEDIA_ITEM_REQUEST,
			mediaId,
			siteId,
		};
		expect( handleMediaItemRequest( action ) ).toEqual(
			expect.arrayContaining( [
				requestingMediaItem( siteId ),
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
		expect( receiveMediaItem( action, media ) ).toEqual(
			expect.arrayContaining( [
				receiveMedia( siteId, media ),
				successMediaItemRequest( siteId, mediaId ),
			] )
		);
	} );
} );

describe( 'receiveMediaItemError', () => {
	test( 'should dispatch failure', () => {
		const siteId = 12345;
		const mediaId = 67890;
		const action = {
			type: MEDIA_ITEM_REQUEST,
			mediaId,
			siteId,
		};
		expect( receiveMediaItemError( action ) ).toEqual( failMediaItemRequest( siteId, mediaId ) );
	} );
} );
