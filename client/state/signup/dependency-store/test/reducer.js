/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SIGNUP_DEPENDENCY_STORE_UPDATE,
	SIGNUP_DEPENDENCY_STORE_RESET,
} from 'state/action-types';

import signupDependencyStore from '../reducer';

describe( 'reducer', () => {
	it( 'should update the signup store', () => {
		expect( signupDependencyStore( {}, {
			type: SIGNUP_DEPENDENCY_STORE_UPDATE,
			data: { test: 123 }
		} ) ).to.be.eql( { test: 123 } );
	} );

	it( 'should reset the signup store', () => {
		expect( signupDependencyStore( { test: 123 }, {
			type: SIGNUP_DEPENDENCY_STORE_RESET,
		} ) ).to.be.eql( {} );
	} );
} );
