/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_PROGRESS_UPDATE, SIGNUP_COMPLETE_RESET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the signup store', () => {
		expect(
			reducer( [], {
				type: SIGNUP_PROGRESS_UPDATE,
				data: [ { test: 123 } ],
			} )
		).to.be.eql( [ { test: 123 } ] );
	} );

	test( 'should reset the signup store', () => {
		expect(
			reducer( [ { test: 123 } ], {
				type: SIGNUP_COMPLETE_RESET,
			} )
		).to.be.eql( [] );
	} );
} );
