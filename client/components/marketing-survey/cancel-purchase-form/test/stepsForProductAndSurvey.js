/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import {
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_JETPACK_BUSINESS,
} from 'lib/plans/constants';
import {
	INITIAL_STEP,
	CONCIERGE_STEP,
	HAPPYCHAT_STEP,
	FINAL_STEP,
} from '../steps';

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
		expect( stepsForProductAndSurvey() ).to.deep.equal( [ INITIAL_STEP, FINAL_STEP ] );
	} );

	describe( 'question one answer is "too hard"', function() {
		const survey = { questionOneRadio: 'tooHard' };

		it( 'should include happychat step if product is personal plan and abtest variant is show', function() {
			const product = { product_slug: PLAN_PERSONAL };
			abtests.chatOfferOnCancel = 'show';
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, HAPPYCHAT_STEP, FINAL_STEP ] );
		} );

		it( 'should not include happychat step if product is personal plan and abtest variant is show', function() {
			const product = { product_slug: PLAN_PERSONAL };
			abtests.chatOfferOnCancel = 'hide';
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, FINAL_STEP ] );
		} );

		it( 'should include happychat step if product is premium plan and abtest is show', function() {
			const product = { product_slug: PLAN_PREMIUM };
			abtests.chatOfferOnCancel = 'show';
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, HAPPYCHAT_STEP, FINAL_STEP ] );
		} );

		it( 'should not include happychat step if product is premium plan and abtest is show', function() {
			const product = { product_slug: PLAN_PREMIUM };
			abtests.chatOfferOnCancel = 'hide';
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, FINAL_STEP ] );
		} );

		it( 'should include concierge step if product is business plan and abtest variant is showConciergeOffer', function() {
			const product = { product_slug: PLAN_BUSINESS };
			abtests.conciergeOfferOnCancel = 'showConciergeOffer';
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, CONCIERGE_STEP, FINAL_STEP ] );
		} );

		it( 'should not include concierge step if product is jetpack business plan and abtest variant is showConciergeOffer', function() {
			const product = { product_slug: PLAN_JETPACK_BUSINESS };
			abtests.conciergeOfferOnCancel = 'showConciergeOffer';
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, FINAL_STEP ] );
		} );

		it( 'should not include concierge step if product is business plan and abtest variant is hideConciergeOffer', function() {
			const product = { product_slug: PLAN_BUSINESS };
			abtests.conciergeOfferOnCancel = 'hideConciergeOffer';
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( [ INITIAL_STEP, FINAL_STEP ] );
		} );
	} );
} );
