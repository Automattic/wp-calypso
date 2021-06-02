/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import nock from 'nock';

/**
 * Internal dependencies
 */
import { receiveTagImages, requestTagImages } from '../actions';
import {
	READER_TAG_IMAGES_REQUEST,
	READER_TAG_IMAGES_REQUEST_SUCCESS,
	READER_TAG_IMAGES_RECEIVE,
} from 'calypso/state/reader/action-types';
import sampleSuccessResponse from './sample-responses.json';

describe( 'actions', () => {
	const spy = jest.fn();

	afterEach( () => {
		spy.mockClear();
	} );

	describe( '#receiveTagImages()', () => {
		test( 'should return an action object', () => {
			const images = [];
			const tag = 'banana';
			const action = receiveTagImages( tag, images );

			expect( action ).toEqual( {
				type: READER_TAG_IMAGES_RECEIVE,
				images,
				tag,
			} );
		} );
	} );

	describe( '#requestTagImages', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/tags/banana/images?number=5' )
				.reply( 200, deepFreeze( sampleSuccessResponse ) );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch properly when receiving a valid response', async () => {
			const dispatchSpy = jest.fn( ( p ) => p );
			const request = requestTagImages( 'banana' )( dispatchSpy );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_TAG_IMAGES_REQUEST,
				tag: 'banana',
			} );

			await request;
			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_TAG_IMAGES_REQUEST_SUCCESS,
				data: sampleSuccessResponse,
				tag: 'banana',
			} );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_TAG_IMAGES_RECEIVE,
				images: sampleSuccessResponse.images,
				tag: 'banana',
			} );
		} );
	} );
} );
