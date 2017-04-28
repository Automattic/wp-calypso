/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import nextStep from '../nextStep';

describe( 'nextStep', function() {
	const steps = [ 'a', 'b', 'c' ];

	it( 'should return final step if current step is unknown', function() {
		expect( nextStep( 'unknown', steps ) ).to.equal( 'c' );
	} );

	it( 'should return final step if current step is final step', function() {
		expect( nextStep( 'c', steps ) ).to.equal( 'c' );
	} );

	it( 'should return next step current step is earlier step', function() {
		expect( nextStep( 'a', steps ) ).to.equal( 'b' );
	} );
} );
