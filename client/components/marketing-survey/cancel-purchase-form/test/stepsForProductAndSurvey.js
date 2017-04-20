/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import {
	INITIAL_STEP,
	CONCIERGE_STEP,
	HAPPYCHAT_STEP,
	FINAL_STEP,
} from '../steps';
import mockProductValues from './mockProductValues';

describe( 'stepsForProductAndSurvey', function() {
	const product = {};
	const survey = { questionOneRadio: 'tooHard' };

	let stepsForProductAndSurvey;

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/product-values', mockProductValues() );
	} );

	before( function() {
		stepsForProductAndSurvey = require( '../stepsForProductAndSurvey' );
	} );

	beforeEach( function() {
		product.isBusiness = () => false;
		product.isPersonal = () => false;
		product.isPremium = () => false;
	} );

	it( 'should return default steps if no state or product', function() {
		expect( stepsForProductAndSurvey() ).to.deep.equal( [ INITIAL_STEP, FINAL_STEP ] );
	} );

	it( 'should include happychat step when question one answer is "too hard" and premium product', function() {
		product.isPremium = () => true;
		expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, HAPPYCHAT_STEP, FINAL_STEP ] );
	} );

	it( 'should include happychat step when question one answer is "too hard" and personal product', function() {
		product.isPersonal = () => true;
		expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, HAPPYCHAT_STEP, FINAL_STEP ] );
	} );

	it( 'should include concierge step when question one answer is "too hard" and business product', function() {
		product.isBusiness = () => true;
		expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, CONCIERGE_STEP, FINAL_STEP ] );
	} );
} );
