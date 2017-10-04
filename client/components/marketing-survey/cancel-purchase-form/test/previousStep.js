/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import previousStep from '../previousStep';

describe( 'previousStep', function() {
	const steps = [ 'a', 'b', 'c' ];

	it( 'should return initial step if current step is unknown', function() {
		expect( previousStep( 'unknown', steps ) ).to.equal( 'a' );
	} );

	it( 'should return initial step if current step is initial step', function() {
		expect( previousStep( 'a', steps ) ).to.equal( 'a' );
	} );

	it( 'should return previous step current step is subsequent step', function() {
		expect( previousStep( 'c', steps ) ).to.equal( 'b' );
	} );
} );
