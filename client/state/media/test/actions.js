import {
	MEDIA_ITEM_REQUEST,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_RECEIVE,
} from 'calypso/state/action-types';
import {
	receiveMedia,
	requestMediaItem,
	successMediaItemRequest,
	failMediaItemRequest,
} from 'calypso/state/media/actions';

describe( 'media - actions - sync', () => {
	describe( 'receiveMedia()', () => {
		describe( 'single', () => {
			test( 'should return an action object', () => {
				const action = receiveMedia( 2916284, { ID: 42, title: 'flowers' } );

				expect( action ).toEqual( {
					type: MEDIA_RECEIVE,
					siteId: 2916284,
					media: [ { ID: 42, title: 'flowers' } ],
					found: undefined,
					query: undefined,
				} );
			} );
		} );

		describe( 'array', () => {
			test( 'should return an action object', () => {
				const action = receiveMedia( 2916284, [ { ID: 42, title: 'flowers' } ] );

				expect( action ).toEqual( {
					type: MEDIA_RECEIVE,
					siteId: 2916284,
					media: [ { ID: 42, title: 'flowers' } ],
					found: undefined,
					query: undefined,
				} );
			} );
		} );

		describe( 'query', () => {
			test( 'should return an action object', () => {
				const action = receiveMedia( 2916284, [ { ID: 42, title: 'flowers' } ], 1, {
					search: 'flowers',
				} );

				expect( action ).toEqual( {
					type: MEDIA_RECEIVE,
					siteId: 2916284,
					media: [ { ID: 42, title: 'flowers' } ],
					found: 1,
					query: { search: 'flowers' },
				} );
			} );
		} );
	} );

	describe( 'requestMediaItem()', () => {
		test( 'should return an action object', () => {
			const action = requestMediaItem( 2916284, 2454 );

			expect( action ).toEqual( {
				type: MEDIA_ITEM_REQUEST,
				siteId: 2916284,
				mediaId: 2454,
			} );
		} );
	} );

	describe( 'successMediaItemRequest()', () => {
		test( 'should return an action object', () => {
			const action = successMediaItemRequest( 2916284, 2454 );

			expect( action ).toEqual( {
				type: MEDIA_ITEM_REQUEST_SUCCESS,
				siteId: 2916284,
				mediaId: 2454,
			} );
		} );
	} );

	describe( 'failMediaItemRequest()', () => {
		test( 'should return an action object', () => {
			const action = failMediaItemRequest( 2916284, 2454 );

			expect( action ).toEqual( {
				type: MEDIA_ITEM_REQUEST_FAILURE,
				siteId: 2916284,
				mediaId: 2454,
				error: null,
			} );
		} );
	} );
} );
