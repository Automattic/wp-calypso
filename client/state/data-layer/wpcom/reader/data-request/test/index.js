/**
 * External dependencies
 */
import sinon from 'sinon';
import { assert, expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_DATA_REQUEST
} from 'state/action-types';
import { readerDataHandler } from '../';

const SAMPLE_ACTION_REQUEST = 'SAMPLE_ACTION_REQUEST';
const SAMPLE_ACTION_REQUEST_SUCCESS = 'SAMPLE_ACTION_REQUEST_SUCCESS';
const SAMPLE_ACTION_REQUEST_FAILURE = 'SAMPLE_ACTION_REQUEST_FAILURE';
const SAMPLE_DATA_FETCH_SUCCESS = Promise.resolve( {
	bool: true,
	object: { a: '1' },
} );
const SAMPLE_DATA_FETCH_FAILURE = Promise.reject( {} );

describe( 'actions', () => {
	const dispatchSpy = sinon.spy();

	beforeEach( () => {
		dispatchSpy.reset();
	} );

	describe( 'requestTeams', () => {

		it( 'request should dispatch success when api succeeds', () => {
			const request = readerDataHandler( { dispatch: dispatchSpy }, {
				type: READER_DATA_REQUEST,
				requestAction: SAMPLE_ACTION_REQUEST,
				dataFetch: SAMPLE_DATA_FETCH_SUCCESS,
			} );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: SAMPLE_ACTION_REQUEST,
			} );

			return request.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: SAMPLE_ACTION_REQUEST_SUCCESS,
					bool: true,
					object: { a: '1' },
				} );

				expect( dispatchSpy.calledTwice );
			} ).catch( ( err ) => {
				assert.fail( err, undefined, 'errback should not have been called' );
			} );
		} );

		it( 'request should dispatch failure when api fails', () => {
			const request = readerDataHandler( { dispatch: dispatchSpy }, {
				type: READER_DATA_REQUEST,
				requestAction: SAMPLE_ACTION_REQUEST,
				dataFetch: SAMPLE_DATA_FETCH_FAILURE,
			} );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: SAMPLE_ACTION_REQUEST,
			} );

			return request.then(
				() => {
					expect( dispatchSpy ).to.have.been.calledWith( {
						type: SAMPLE_ACTION_REQUEST_FAILURE,
						error: sinon.match.any,
					} );

					expect( dispatchSpy.calledTwice );
				},
				err => {
					assert.fail( err, undefined, 'errback should not have been called' );
				}
			);
		} );
	} );
} );
