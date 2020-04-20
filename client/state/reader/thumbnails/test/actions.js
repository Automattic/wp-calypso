/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';
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
} from 'state/reader/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	describe( '#receiveThumbnail', () => {
		test( 'should return an action object', () => {
			const embedUrl = 'embedUrl';
			const thumbnailUrl = 'thumbnailUrl';
			const action = receiveThumbnail( embedUrl, thumbnailUrl );

			expect( action ).to.eql( {
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

		useNock( ( nock ) => {
			nock( 'https://vimeo.com' )
				.get( '/api/v2/video/6999927.json' )
				.reply( 200, deepFreeze( sampleVimeoResponse ) );
			nock( 'https://vimeo.com' )
				.get( '/api/v2/video/6999928.json' )
				.reply( 500, deepFreeze( {} ) );
		} );

		test( 'vimeo: should dispatch properly when receiving a valid response', () => {
			const dispatchSpy = sinon.spy();
			const request = requestThumbnail( successfulEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_THUMBNAIL_REQUEST,
				embedUrl: successfulEmbedUrl,
			} );

			return request
				.then( () => {
					expect( dispatchSpy ).to.have.been.calledWith( {
						type: READER_THUMBNAIL_REQUEST_SUCCESS,
						embedUrl: successfulEmbedUrl,
					} );

					expect( dispatchSpy ).to.have.been.calledWith( {
						type: READER_THUMBNAIL_RECEIVE,
						embedUrl: successfulEmbedUrl,
						thumbnailUrl,
					} );

					expect( dispatchSpy ).to.have.been.calledThrice;
				} )
				.catch( ( err ) => {
					assert.fail( err, undefined, 'errback should not have been called' );
				} );
		} );

		test( 'youtube: should dispatch action with thumbnail instantly', () => {
			const dispatchSpy = sinon.spy();
			requestThumbnail( youtubeEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_THUMBNAIL_RECEIVE,
				embedUrl: youtubeEmbedUrl,
				thumbnailUrl: youtubeThumbnailUrl,
			} );
			expect( dispatchSpy ).to.have.been.calledOnce;
		} );

		test( 'should dispatch the right actions if network request fails', () => {
			const dispatchSpy = sinon.spy();
			const request = requestThumbnail( failureEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_THUMBNAIL_REQUEST,
				embedUrl: failureEmbedUrl,
			} );

			return request
				.then( () => {
					expect( dispatchSpy ).to.have.been.calledWithMatch( {
						type: READER_THUMBNAIL_REQUEST_FAILURE,
						embedUrl: failureEmbedUrl,
					} );

					expect( dispatchSpy ).to.have.been.calledTwice;
				} )
				.catch( ( err ) => {
					assert.fail( err, undefined, 'errback should not have been called' );
				} );
		} );

		test( 'should dispatch a failure action instantly if unsupported', () => {
			const dispatchSpy = sinon.spy();
			requestThumbnail( unsupportedEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_THUMBNAIL_REQUEST_FAILURE,
				embedUrl: unsupportedEmbedUrl,
				error: { type: 'UNSUPPORTED_EMBED' },
			} );

			expect( dispatchSpy ).to.have.been.calledOnce;
		} );
	} );
} );
