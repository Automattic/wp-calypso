/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getReducer } from '../reducer';

describe( 'getReducer', () => {
	it( 'should return a reducer that will export expected reducer keys', () => {
		expect( getReducer( {
			request: 'TEST_REQUEST',
			success: 'TEST_SUCCESS',
			failure: 'TEST_FAILURE'
		} )( undefined, {} ) ).to.have.keys( [
			'countries',
			'isFetching'
		] );
	} );
} );
