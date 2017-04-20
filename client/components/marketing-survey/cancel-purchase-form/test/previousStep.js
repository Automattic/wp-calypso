/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'previousStep', function() {
	const product = {};
	const survey = {};

	let previousStep;

	useMockery( ( mockery ) => {
		const stepsForProductAndSurvey = ( s, p ) => {
			expect( s ).to.equal( survey );
			expect( p ).to.equal( product );
			return [ 'a', 'b', 'c' ];
		};
		mockery.registerMock( './stepsForProductAndSurvey', stepsForProductAndSurvey );
	} );

	before( function() {
		previousStep = require( '../previousStep' );
	} );

	it( 'should return false if current step is unknown', function() {
		expect( previousStep( 'unknown', survey, product ) ).to.equal( false );
	} );

	it( 'should return false if current step is initial step', function() {
		expect( previousStep( 'a', survey, product ) ).to.equal( false );
	} );

	it( 'should return previous step current step is subsequent step', function() {
		expect( previousStep( 'c', survey, product ) ).to.equal( 'b' );
	} );
} );
