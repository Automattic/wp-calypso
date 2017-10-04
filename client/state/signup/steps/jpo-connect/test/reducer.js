/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_JPO_CONNECT_SET } from 'state/action-types';

import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'should set connect to the given object', () => {
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
	it( 'should reset to an empty string', () => {
		expect(
			reducer( 'previous state', {
				type: SIGNUP_COMPLETE_RESET,
			} )
		).to.be.null;
	} );
} );
