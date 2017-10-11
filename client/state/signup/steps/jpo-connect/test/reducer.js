/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_JPO_CONNECT_SET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should set connect to the given object', () => {
		const testJpoConnectObject = {
			queryObject: { client_id: '123' },
			isAuthorizing: true,
		};
		expect(
			reducer( 'previous state', {
				type: SIGNUP_STEPS_JPO_CONNECT_SET,
				connect: testJpoConnectObject,
			} )
		).to.deep.equal( testJpoConnectObject );
	} );
	test( 'should reset to an empty string', () => {
		expect(
			reducer( 'previous state', {
				type: SIGNUP_COMPLETE_RESET,
			} )
		).to.be.null;
	} );
} );
