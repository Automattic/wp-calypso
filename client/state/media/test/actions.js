/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	MEDIA_DELETE,
	MEDIA_ITEM_REQUEST,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_ITEM_REQUESTING,
	MEDIA_RECEIVE
} from 'state/action-types';
import {
	receiveMedia,
	deleteMedia,
	requestMediaItem,
	requestingMediaItem,
	successMediaItemRequest,
	failMediaItemRequest
} from '../actions';

describe( 'actions', () => {
	describe( 'receiveMedia()', () => {
		context( 'single', () => {
			it( 'should return an action object', () => {
				const action = receiveMedia( 2916284, { ID: 42, title: 'flowers' } );

				expect( action ).to.eql( {
					type: MEDIA_RECEIVE,
					siteId: 2916284,
					media: [ { ID: 42, title: 'flowers' } ],
					found: undefined,
					query: undefined
				} );
			} );
		} );

		context( 'array', () => {
			it( 'should return an action object', () => {
				const action = receiveMedia( 2916284, [ { ID: 42, title: 'flowers' } ] );

				expect( action ).to.eql( {
					type: MEDIA_RECEIVE,
					siteId: 2916284,
					media: [ { ID: 42, title: 'flowers' } ],
					found: undefined,
					query: undefined
				} );
			} );
		} );

		context( 'query', () => {
			it( 'should return an action object', () => {
				const action = receiveMedia( 2916284, [ { ID: 42, title: 'flowers' } ],
					1, { search: 'flowers' } );

				expect( action ).to.eql( {
					type: MEDIA_RECEIVE,
					siteId: 2916284,
					media: [ { ID: 42, title: 'flowers' } ],
					found: 1,
					query: { search: 'flowers' }
				} );
			} );
		} );
	} );

	describe( 'deleteMedia()', () => {
		context( 'single', () => {
			it( 'should return an action object', () => {
				const action = deleteMedia( 2916284, 42 );

				expect( action ).to.eql( {
					type: MEDIA_DELETE,
					siteId: 2916284,
					mediaIds: [ 42 ]
				} );
			} );
		} );

		context( 'array', () => {
			it( 'should return an action object', () => {
				const action = deleteMedia( 2916284, [ 42 ] );

				expect( action ).to.eql( {
					type: MEDIA_DELETE,
					siteId: 2916284,
					mediaIds: [ 42 ]
				} );
			} );
		} );
	} );

	describe( 'requestMediaItem()', () => {
		it( 'should return an action object', () => {
			const action = requestMediaItem( 2916284, 2454 );

			expect( action ).to.eql( {
				type: MEDIA_ITEM_REQUEST,
				siteId: 2916284,
				mediaId: 2454
			} );
		} );
	} );

	describe( 'requestingMediaItem()', () => {
		it( 'should return an action object', () => {
			const action = requestingMediaItem( 2916284, 2454 );

			expect( action ).to.eql( {
				type: MEDIA_ITEM_REQUESTING,
				siteId: 2916284,
				mediaId: 2454
			} );
		} );
	} );

	describe( 'successMediaItemRequest()', () => {
		it( 'should return an action object', () => {
			const action = successMediaItemRequest( 2916284, 2454 );

			expect( action ).to.eql( {
				type: MEDIA_ITEM_REQUEST_SUCCESS,
				siteId: 2916284,
				mediaId: 2454
			} );
		} );
	} );

	describe( 'failMediaItemRequest()', () => {
		it( 'should return an action object', () => {
			const action = failMediaItemRequest( 2916284, 2454 );

			expect( action ).to.eql( {
				type: MEDIA_ITEM_REQUEST_FAILURE,
				siteId: 2916284,
				mediaId: 2454
			} );
		} );
	} );
} );
