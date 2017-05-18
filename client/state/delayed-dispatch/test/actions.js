/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { delayDispatch } from '../actions';

const action = { type: 'SPIN' };
const delay = 1337;

describe( '#delayDispatch', () => {
	it( 'should include the optional message if given', () => {
		expect( delayDispatch( delay, action, 'waiting…' ) ).to.have.property( 'message', 'waiting…' );
	} );

	it( 'should not include the optional message if not given', () => {
		expect( delayDispatch( delay, action, '' ) ).to.not.have.property( 'message' );
		expect( delayDispatch( delay, action ) ).to.not.have.property( 'message' );
	} );
} );
