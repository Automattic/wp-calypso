/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_STEPS_DESIGN_TYPE_SET } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should update the design type', () => {
		expect(
			reducer(
				{},
				{
					type: SIGNUP_STEPS_DESIGN_TYPE_SET,
					designType: 'design type',
				}
			)
		).to.be.eql( 'design type' );
	} );
} );
