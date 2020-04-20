/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveTagImages, requestTagImages } from '../actions';
import {
	READER_TAG_IMAGES_REQUEST,
	READER_TAG_IMAGES_REQUEST_SUCCESS,
	READER_TAG_IMAGES_RECEIVE,
} from 'state/reader/action-types';
import useNock from 'test/helpers/use-nock';
import sampleSuccessResponse from './sample-responses.json';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	describe( '#receiveTagImages()', () => {
		test( 'should return an action object', () => {
			const images = [];
			const tag = 'banana';
			const action = receiveTagImages( tag, images );

			expect( action ).to.eql( {
				type: READER_TAG_IMAGES_RECEIVE,
				images,
				tag,
			} );
		} );
	} );

	describe( '#requestTagImages', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/tags/banana/images?number=5' )
				.reply( 200, deepFreeze( sampleSuccessResponse ) );
		} );

		test( 'should dispatch properly when receiving a valid response', () => {
			const dispatchSpy = sinon.stub();
			dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );
			const request = requestTagImages( 'banana' )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_TAG_IMAGES_REQUEST,
				tag: 'banana',
			} );

			return request
				.then( () => {
					expect( dispatchSpy ).to.have.been.calledWith( {
						type: READER_TAG_IMAGES_REQUEST_SUCCESS,
						data: sampleSuccessResponse,
						tag: 'banana',
					} );

					expect( dispatchSpy ).to.have.been.calledWith( {
						type: READER_TAG_IMAGES_RECEIVE,
						images: sampleSuccessResponse.images,
						tag: 'banana',
					} );
				} )
				.catch( ( err ) => {
					assert.fail( err, undefined, 'errback should not have been called' );
				} );
		} );
	} );
} );
