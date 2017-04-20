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

describe( 'previousStep', function() {
	const product = {};
	const survey = { questionOneRadio: 'tooHard' };

	let previousStep;

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/product-values', mockProductValues() );
	} );

	before( function() {
		previousStep = require( '../previousStep' );
	} );

	beforeEach( function() {
		product.isBusiness = () => false;
		product.isPersonal = () => false;
		product.isPremium = () => false;
	} );

	it( 'should returning false if current step is initial step', function() {
		expect( previousStep( INITIAL_STEP ) ).to.equal( false );
	} );

	it( 'should return initial step if current step is happychat step', function() {
		product.isPremium = () => true;
		expect( previousStep( HAPPYCHAT_STEP, survey, product ) ).to.equal( INITIAL_STEP );
	} );

	it( 'should return happychat step from final step when question one answer is "too hard" and premium product', function() {
		product.isPremium = () => true;
		expect( previousStep( FINAL_STEP, survey, product ) ).to.equal( HAPPYCHAT_STEP );
	} );

	it( 'should return initial step if current step is concierge step', function() {
		product.isBusiness = () => true;
		expect( previousStep( CONCIERGE_STEP, survey, product ) ).to.equal( INITIAL_STEP );
	} );

	it( 'should return concierge step from final step when question one answer is "too hard" and business product', function() {
		product.isBusiness = () => true;
		expect( previousStep( FINAL_STEP, survey, product ) ).to.equal( CONCIERGE_STEP );
	} );
} );
