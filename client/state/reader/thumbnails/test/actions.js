import deepFreeze from 'deep-freeze';
import nock from 'nock';
// Importing `jest-fetch-mock` adds a jest-friendly `fetch` polyfill to the global scope.
import 'jest-fetch-mock';
import { READER_THUMBNAIL_RECEIVE } from 'calypso/state/reader/action-types';
import { receiveThumbnail, requestThumbnail } from '../actions';
import sampleVideoPressResponse from './fixtures/sample-videopress-response.js';
import sampleVimeoResponse from './fixtures/sample-vimeo-response.js';

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
		const thumbnailUrl = 'https://i.vimeocdn.com/video/459553940_640.webp';
		const successfulEmbedUrl = 'https://vimeo.com/6999927';
		const unSuccessfulEmbedUrl = 'https://vimeo.com/6999928';
		const youtubeEmbedUrl = 'https://youtube.com/?v=UoOCrbV3ZQ';
		const youtubeThumbnailUrl = 'https://img.youtube.com/vi/UoOCrbV3ZQ/mqdefault.jpg';
		const videopressEmbedUrl = 'https://videopress.com/v/ABCDabcd';
		const failingVideopressEmbedUrl = 'https://videopress.com/v/FOO0barr';
		const videopressThumbnailUrl =
			'https://videos.files.wordpress.com/ABCDabcd/filename.original.jpg';

		beforeAll( () => {
			nock( 'https://vimeo.com' )
				.get( '/api/v2/video/6999927.json' )
				.reply( 200, deepFreeze( sampleVimeoResponse ) );
			nock( 'https://vimeo.com' )
				.get( '/api/v2/video/6999928.json' )
				.reply( 500, deepFreeze( {} ) );
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/videos/ABCDabcd/poster' )
				.reply( 200, deepFreeze( sampleVideoPressResponse ) );
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/videos/FOO0barr/poster' )
				.reply( 500, deepFreeze( {} ) );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'vimeo: should dispatch properly when receiving a valid response', async () => {
			const dispatchSpy = jest.fn();
			await requestThumbnail( successfulEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_THUMBNAIL_RECEIVE,
				embedUrl: successfulEmbedUrl,
				thumbnailUrl,
			} );

			expect( dispatchSpy ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'videopress: should dispatch properly when receiving a valid response', async () => {
			const dispatchSpy = jest.fn();
			await requestThumbnail( videopressEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_THUMBNAIL_RECEIVE,
				embedUrl: videopressEmbedUrl,
				thumbnailUrl: videopressThumbnailUrl,
			} );

			expect( dispatchSpy ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'vimeo: should handle fetch failures properly', async () => {
			const dispatchSpy = jest.fn();

			expect( async () => {
				await requestThumbnail( unSuccessfulEmbedUrl )( dispatchSpy );
			} ).not.toThrow();

			expect( dispatchSpy ).not.toHaveBeenCalled();
		} );

		test( 'videopress: should handle fetch failures properly', async () => {
			const dispatchSpy = jest.fn();

			expect( async () => {
				await requestThumbnail( failingVideopressEmbedUrl )( dispatchSpy );
			} ).not.toThrow();

			expect( dispatchSpy ).not.toHaveBeenCalled();
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
	} );
} );
