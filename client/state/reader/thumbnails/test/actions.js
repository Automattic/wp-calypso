/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_THUMBNAIL_REQUEST_FAILURE,
	READER_THUMBNAIL_RECEIVE,
} from 'state/action-types';
import { receiveThumbnail, requestThumbnail } from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receiveThumbnail', () => {
		it( 'should return an action object', () => {
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
		const vimeoEmbedThumbnailUrl = 'https://i.vimeocdn.com/video/6999928.jpg';
		const vimeoEmbedUrl = 'https://vimeo.com/6999928';
		const youtubeEmbedUrl = 'https://youtube.com/?v=UoOCrbV3ZQ';
		const youtubeThumbnailUrl = 'https://img.youtube.com/vi/UoOCrbV3ZQ/mqdefault.jpg';

		it( 'vimeo: should dispatch action with thumbnail instantly', () => {
			const dispatchSpy = sinon.spy();
			requestThumbnail( vimeoEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_THUMBNAIL_RECEIVE,
				embedUrl: vimeoEmbedUrl,
				thumbnailUrl: vimeoEmbedThumbnailUrl,
			} );
		} );

		it( 'youtube: should dispatch action with thumbnail instantly', () => {
			const dispatchSpy = sinon.spy();
			requestThumbnail( youtubeEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_THUMBNAIL_RECEIVE,
				embedUrl: youtubeEmbedUrl,
				thumbnailUrl: youtubeThumbnailUrl,
			} );
			expect( dispatchSpy.calledOnce );
		} );

		it( 'should dispatch a failure action instantly if unsupported', () => {
			const dispatchSpy = sinon.spy();
			requestThumbnail( unsupportedEmbedUrl )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_THUMBNAIL_REQUEST_FAILURE,
				embedUrl: unsupportedEmbedUrl,
				error: { type: 'UNSUPPORTED_EMBED' },
			} );

			expect( dispatchSpy.calledOnce );
		} );
	} );
} );
