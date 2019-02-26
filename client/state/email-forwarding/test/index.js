/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import emailForwardsReducer from '../reducer';
import { EMAIL_FORWARDING_RECEIVE } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should save data', () => {
		const state = emailForwardsReducer( undefined, {
			type: EMAIL_FORWARDING_RECEIVE,
			domainName: 'test.com',
			data: {
				hello: 'world',
			},
		} );
		expect( state ).to.eql( {
			'test.com': {
				forwards: { hello: 'world' },
				error: null,
				isRequesting: false,
			},
		} );
	} );
} );
