/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useFakeTimers } from 'test/helpers/use-sinon';
import { delayDispatch } from '../actions';

const action = { type: 'SPIN' };
const delay = 1337;

describe( '#delayDispatch', () => {
	// Initializes clock to 0
	useFakeTimers();

	it( 'should attach a `dispatchBy` value', () => {
		expect( delayDispatch( delay, action ) ).to.have.property( 'dispatchBy' );
	} );

	it( 'should set `dispatchBy` to appropriate value', () => {
		expect( delayDispatch( delay, action ).dispatchBy ).to.equal( delay );
	} );

	it( 'should include the optional message if given', () => {
		expect( delayDispatch( delay, action, 'waiting…' ) ).to.have.property( 'message', 'waiting…' );
	} );

	it( 'should not include the optional message if not given', () => {
		expect( delayDispatch( delay, action, '' ) ).to.not.have.property( 'message' );
		expect( delayDispatch( delay, action ) ).to.not.have.property( 'message' );
	} );
} );
