/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'nextStep', function() {
	const product = {};
	const survey = {};

	let nextStep;

	useMockery( ( mockery ) => {
		const stepsForProductAndSurvey = ( s, p ) => {
			expect( s ).to.equal( survey );
			expect( p ).to.equal( product );
			return [ 'a', 'b', 'c' ];
		};
		mockery.registerMock( './stepsForProductAndSurvey', stepsForProductAndSurvey );
	} );

	before( function() {
		nextStep = require( '../nextStep' );
	} );

	it( 'should returning false if current step is unknown', function() {
		expect( nextStep( 'unknown', survey, product ) ).to.equal( false );
	} );

	it( 'should returning false if current step is final step', function() {
		expect( nextStep( 'c', survey, product ) ).to.equal( false );
	} );

	it( 'should return next step current step is earlier step', function() {
		expect( nextStep( 'a', survey, product ) ).to.equal( 'b' );
	} );
} );
