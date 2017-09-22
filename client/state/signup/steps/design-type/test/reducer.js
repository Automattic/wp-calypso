/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SIGNUP_STEPS_DESIGN_TYPE_SET,
} from 'state/action-types';

import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'should update the design type', () => {
		expect( reducer( {}, {
			type: SIGNUP_STEPS_DESIGN_TYPE_SET,
			designType: 'design type'
		} ) ).to.be.eql( 'design type' );
	} );
} );
