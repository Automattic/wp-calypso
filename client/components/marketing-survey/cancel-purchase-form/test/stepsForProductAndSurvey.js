/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import * as plans from 'lib/plans/constants';
import * as steps from '../steps';

const DEFAULT_STEPS = [ steps.INITIAL_STEP, steps.FINAL_STEP ];
const DEFAULT_STEPS_WITH_HAPPYCHAT = [ steps.INITIAL_STEP, steps.HAPPYCHAT_STEP, steps.FINAL_STEP ];
const DEFAULT_STEPS_WITH_CONCIERGE = [ steps.INITIAL_STEP, steps.CONCIERGE_STEP, steps.FINAL_STEP ];

describe( 'stepsForProductAndSurvey', function() {
	const abtests = {};

	let stepsForProductAndSurvey;

	useMockery( ( mockery ) => {
		const abtest = ( name ) => abtests[ name ];
		mockery.registerMock( 'lib/abtest', { abtest } );
	} );

	before( function() {
		stepsForProductAndSurvey = require( '../stepsForProductAndSurvey' );
	} );

	it( 'should return default steps if no state or product', function() {
		expect( stepsForProductAndSurvey() ).to.deep.equal( DEFAULT_STEPS );
	} );

	describe( 'question one answer is "too hard"', function() {
		const survey = { questionOneRadio: 'tooHard' };

		it( 'should include happychat step if product is personal plan, abtest variant is show and happychat is available', function() {
			const product = { product_slug: plans.PLAN_PERSONAL };
			abtests.chatOfferOnCancel = 'show';
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		it( 'should not include happychat step if product is personal plan but happychat is not available', function() {
			const product = { product_slug: plans.PLAN_PERSONAL };
			expect( stepsForProductAndSurvey( survey, product, false ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		it( 'should not include happychat step if product is personal plan, happychat is available but abtest variant is hide', function() {
			const product = { product_slug: plans.PLAN_PERSONAL };
			abtests.chatOfferOnCancel = 'hide';
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		it( 'should include happychat step if product is premium plan, abtest is show and happychat is available', function() {
			const product = { product_slug: plans.PLAN_PREMIUM };
			abtests.chatOfferOnCancel = 'show';
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		it( 'should not include happychat step if product is premium plan but happychat is not available', function() {
			const product = { product_slug: plans.PLAN_PREMIUM };
			expect( stepsForProductAndSurvey( survey, product, false ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		it( 'should not include happychat step if product is premium plan, happychat is available but abtest is hide', function() {
			const product = { product_slug: plans.PLAN_PREMIUM };
			abtests.chatOfferOnCancel = 'hide';
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		it( 'should include concierge step if product is business plan, function() {
			const product = { product_slug: plans.PLAN_BUSINESS };
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( DEFAULT_STEPS_WITH_CONCIERGE );
		} );

		it( 'should not include concierge step if product is jetpack business plan, function() {
			const product = { product_slug: plans.PLAN_JETPACK_BUSINESS };
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( DEFAULT_STEPS );
		} );
	} );
} );
