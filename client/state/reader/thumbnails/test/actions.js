/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import nock from 'nock';

// Importing `jest-fetch-mock` adds a jest-friendly `fetch` polyfill to the global scope.
import 'jest-fetch-mock';

/**
 * Internal dependencies
 */
import { receiveThumbnail, requestThumbnail } from '../actions';
import sampleVimeoResponse from './fixtures/sample-vimeo-response.js';
import {
	READER_THUMBNAIL_REQUEST,
	READER_THUMBNAIL_REQUEST_SUCCESS,
	READER_THUMBNAIL_REQUEST_FAILURE,
	READER_THUMBNAIL_RECEIVE,
} from 'calypso/state/reader/action-types';

describe( 'actions', () => {
	const spy = jest.fn();

	afterEach( () => {
		spy.mockClear();
	} );

	describe( '#receiveThumbnail', () => {
		test( 'should return an action object', () => {
			const embedUrl = 'embedUrl';
			const thumbnailUrl = 'thumbnailUrl';
			const action = receiveThumbnail( embedUrl, thumbnailUrl );

			expect( action ).toEqual( {
				type: READER_THUMBNAIL_RECEIVE,
				embedUrl,
				thumbnailUrl,
			} );
		} );
	} );

	describe( '#requestThumbnail', () => {
		const unsupportedEmbedUrl = 'not-a-real-url';
		const thumbnailUrl = 'https://i.vimeocdn.com/video/459553940_640.webp';
		const successfulEmbedUrl = 'https://vimeo.com/6999927';
		const failureEmbedUrl = 'https://vimeo.com/6999928';
		const youtubeEmbedUrl = 'https://youtube.com/?v=UoOCrbV3ZQ';
		const youtubeThumbnailUrl = 'https://img.youtube.com/vi/UoOCrbV3ZQ/mqdefault.jpg';

		beforeAll( () => {
			nock( 'https://vimeo.com' )
				.get( '/api/v2/video/6999927.json' )
				.reply( 200, deepFreeze( sampleVimeoResponse ) );
			nock( 'https://vimeo.com' )
				.get( '/api/v2/video/6999928.json' )
				.reply( 500, deepFreeze( {} ) );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'vimeo: should dispatch properly when receiving a valid response', async () => {
			const dispatchSpy = jest.fn();
			const request = requestThumbnail( successfulEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_THUMBNAIL_REQUEST,
				embedUrl: successfulEmbedUrl,
			} );

			await request;

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_THUMBNAIL_REQUEST_SUCCESS,
				embedUrl: successfulEmbedUrl,
			} );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_THUMBNAIL_RECEIVE,
				embedUrl: successfulEmbedUrl,
				thumbnailUrl,
			} );

			expect( dispatchSpy ).toHaveBeenCalledTimes( 3 );
		} );

		test( 'youtube: should dispatch action with thumbnail instantly', () => {
			const dispatchSpy = jest.fn();
			requestThumbnail( youtubeEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_THUMBNAIL_RECEIVE,
				embedUrl: youtubeEmbedUrl,
				thumbnailUrl: youtubeThumbnailUrl,
			} );
			expect( dispatchSpy ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should dispatch the right actions if network request fails', async () => {
			const dispatchSpy = jest.fn();
			const request = requestThumbnail( failureEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_THUMBNAIL_REQUEST,
				embedUrl: failureEmbedUrl,
			} );

			await request;

			expect( dispatchSpy ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: READER_THUMBNAIL_REQUEST_FAILURE,
					embedUrl: failureEmbedUrl,
				} )
			);

			expect( dispatchSpy ).toHaveBeenCalledTimes( 2 );
		} );

		test( 'should dispatch a failure action instantly if unsupported', () => {
			const dispatchSpy = jest.fn();
			requestThumbnail( unsupportedEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_THUMBNAIL_REQUEST_FAILURE,
				embedUrl: unsupportedEmbedUrl,
				error: { type: 'UNSUPPORTED_EMBED' },
			} );

			expect( dispatchSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
