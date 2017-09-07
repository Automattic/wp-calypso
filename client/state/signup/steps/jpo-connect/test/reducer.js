/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_JPO_CONNECT_SET,
} from 'state/action-types';

import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'should set connect to the given string', () => {
		expect( reducer( 'previous state', {
			type: SIGNUP_STEPS_JPO_CONNECT_SET,
			connect: 'connect'
		} ) ).to.be.eql( 'connect' );
	} );
	it( 'should reset to an empty string', () => {
		expect( reducer( 'previous state', {
			type: SIGNUP_COMPLETE_RESET,
		} ) ).to.be.eql( '' );
	} );
} );
