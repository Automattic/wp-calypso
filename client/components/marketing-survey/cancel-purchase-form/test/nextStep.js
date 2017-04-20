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

describe( 'nextStep', function() {
	const product = {};
	const survey = { questionOneRadio: 'tooHard' };

	let nextStep;

	useMockery( ( mockery ) => {
		const productValues = {
			isBusiness: ( arg ) => arg.isBusiness(),
			isPersonal: ( arg ) => arg.isPersonal(),
			isPremium: ( arg ) => arg.isPremium(),
		};
		mockery.registerMock( 'lib/product-values', productValues );
	} );

	before( function() {
		nextStep = require( '../nextStep' );
	} );

	beforeEach( function() {
		product.isBusiness = () => false;
		product.isPersonal = () => false;
		product.isPremium = () => false;
	} );

	it( 'should default to returning initial step', function() {
		expect( nextStep() ).to.equal( INITIAL_STEP );
	} );

	it( 'should return false from final step', function() {
		expect( nextStep( FINAL_STEP ) ).to.equal( false );
	} );

	it( 'should return final step from initial step without survey data or product', function() {
		expect( nextStep( INITIAL_STEP ) ).to.equal( FINAL_STEP );
	} );

	it( 'should return concierge step from initial step when question one answer is "too hard" and business product', function() {
		product.isBusiness = () => true;
		expect( nextStep( INITIAL_STEP, survey, product ) ).to.equal( CONCIERGE_STEP );
	} );

	it( 'should return happychat step from initial step when question one answer is "too hard" and personal product', function() {
		product.isPersonal = () => true;
		expect( nextStep( INITIAL_STEP, survey, product ) ).to.equal( HAPPYCHAT_STEP );
	} );

	it( 'should return happychat step from initial step when question one answer is "too hard" and premium product', function() {
		product.isPremium = () => true;
		expect( nextStep( INITIAL_STEP, survey, product ) ).to.equal( HAPPYCHAT_STEP );
	} );
} );
