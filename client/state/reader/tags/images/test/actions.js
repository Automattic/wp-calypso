/**
 * External dependencies
 */
import sinon from 'sinon';
import { assert, expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
	READER_TAG_IMAGES_REQUEST,
	READER_TAG_IMAGES_REQUEST_SUCCESS,
	READER_TAG_IMAGES_RECEIVE,
} from 'state/action-types';

import { sampleSuccessResponse } from '../sample_responses';

describe( 'actions', () => {
	let receiveTagImages, requestTagImages;
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
		const actions = require( '../actions' );
		receiveTagImages = actions.receiveTagImages;
		requestTagImages = actions.requestTagImages;
	} );

	describe( '#receiveTagImages()', () => {
		it( 'should return an action object', () => {
			const images = {};
			const action = receiveTagImages( images );

			expect( action ).to.eql( {
				type: READER_TAG_IMAGES_RECEIVE,
				images
			} );
		} );
	} );

	describe( '#requestTagImages', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/tags/banana/images?number=1' )
				.reply( 200, deepFreeze( sampleSuccessResponse ) );
		} );

		it( 'should dispatch properly when receiving a valid response', () => {
			const dispatchSpy = sinon.stub();
			dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );
			const request = requestTagImages( 'banana' )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_TAG_IMAGES_REQUEST
			} );

			return request.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_TAG_IMAGES_REQUEST_SUCCESS,
					data: sampleSuccessResponse
				} );

				// @todo
				// expect( dispatchSpy ).to.have.been.calledWith( {
				// 	type: READER_TAG_IMAGES_RECEIVE,
				// 	images: [ ]
				// } );
			} ).catch( ( err ) => {
				assert.fail( err, undefined, 'errback should not have been called' );
			} );
		} );
	} );
} );
