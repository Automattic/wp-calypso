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
import { MEDIA_ITEM_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	failMediaItemRequest,
	failMediaRequest,
	receiveMedia,
	setNextPageHandle,
	successMediaItemRequest,
	successMediaRequest,
} from 'state/media/actions';

describe( 'media request', () => {
	test( 'should dispatch SUCCESS action when request completes', () => {
		const dispatch = jest.fn();

		const meta = Symbol( 'media request meta' );

		requestMediaSuccess(
			{ siteId: 2916284, query: 'a=b' },
			{ media: { ID: 10, title: 'media title' }, found: true, meta }
		)( dispatch );

		expect( dispatch ).toHaveBeenCalledWith( successMediaRequest( 2916284, 'a=b' ) );
		expect( dispatch ).toHaveBeenCalledWith(
			receiveMedia( 2916284, { ID: 10, title: 'media title' }, true, 'a=b' )
		);
		expect( dispatch ).toHaveBeenCalledWith( setNextPageHandle( 2916284, meta ) );
	} );

	test( 'should dispatch FAILURE action when request fails', () => {
		const dispatch = jest.fn();

		requestMediaError( { siteId: 2916284, query: 'a=b' } )( dispatch );

		expect( dispatch ).toHaveBeenCalledWith( failMediaRequest( 2916284, 'a=b' ) );
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

		const dispatch = jest.fn();

		receiveMediaItem( action, media )( dispatch );

		expect( dispatch ).toHaveBeenNthCalledWith( 1, receiveMedia( siteId, media ) );
		expect( dispatch ).toHaveBeenNthCalledWith( 2, successMediaItemRequest( siteId, mediaId ) );
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

		const dispatch = jest.fn();

		receiveMediaItemError( action )( dispatch );

		expect( dispatch ).toHaveBeenCalledWith( failMediaItemRequest( siteId, mediaId ) );
	} );
} );
