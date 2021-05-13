/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import * as steps from '../steps';
import stepsForProductAndSurvey from '../steps-for-product-and-survey';
import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
} from '@automattic/calypso-products';

const PLAN_SURVEY_STEPS = [ steps.INITIAL_STEP, steps.FINAL_STEP ];
const DEFAULT_STEPS_WITH_UPGRADE_AT_STEP = [
	steps.INITIAL_STEP,
	steps.UPGRADE_AT_STEP,
	steps.FINAL_STEP,
];
const DEFAULT_STEPS_WITH_BUSINESS_AT_STEP = [
	steps.INITIAL_STEP,
	steps.BUSINESS_AT_STEP,
	steps.FINAL_STEP,
];
const DEFAULT_STEPS = [ steps.FINAL_STEP ];

describe( 'stepsForProductAndSurvey', () => {
	test( 'should return default steps if no state or product', () => {
		expect( stepsForProductAndSurvey() ).to.deep.equal( DEFAULT_STEPS );
	} );

	test( 'should return default steps if non-plan product', () => {
		// we use a dotblog domain registration here, but it should work for all other non-plan products.
		expect(
			stepsForProductAndSurvey( {}, { product_slug: 'dotblog_domain' }, false, false )
		).to.deep.equal( DEFAULT_STEPS );
	} );

	describe( 'question one answer is not "could not install" and precancellation chat turned "On"', () => {
		const survey = { questionOneRadio: 'tooHard' };
		const precancellationChatToggle = true;

		test( 'should include happychat step if product is personal plan and happychat is available', () => {
			const product = { product_slug: PLAN_PERSONAL };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( steps.DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		test( 'should include happychat step if product is personal plan and happychat is available (2y)', () => {
			const product = { product_slug: PLAN_PERSONAL_2_YEARS };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( steps.DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		test( 'should not include happychat step if product is personal plan but happychat is not available', () => {
			const product = { product_slug: PLAN_PERSONAL };
			expect(
				stepsForProductAndSurvey( survey, product, false, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should not include happychat step if product is personal plan but happychat is not available (2y)', () => {
			const product = { product_slug: PLAN_PERSONAL_2_YEARS };
			expect(
				stepsForProductAndSurvey( survey, product, false, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should include happychat step if product is premium plan and happychat is available', () => {
			const product = { product_slug: PLAN_PREMIUM };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( steps.DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		test( 'should include happychat step if product is premium plan and happychat is available (2y)', () => {
			const product = { product_slug: PLAN_PREMIUM_2_YEARS };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( steps.DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		test( 'should not include happychat step if product is premium plan but happychat is not available', () => {
			const product = { product_slug: PLAN_PREMIUM };
			expect(
				stepsForProductAndSurvey( survey, product, false, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should not include happychat step if product is premium plan but happychat is not available (2y)', () => {
			const product = { product_slug: PLAN_PREMIUM_2_YEARS };
			expect(
				stepsForProductAndSurvey( survey, product, false, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should include happychat step if product is business plan and happychat is available', () => {
			const product = { product_slug: PLAN_BUSINESS };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( steps.DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		test( 'should include happychat step if product is business plan and happychat is available (2y)', () => {
			const product = { product_slug: PLAN_BUSINESS_2_YEARS };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( steps.DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		test( 'should include happychat step if product is business plan but happychat is not available', () => {
			const product = { product_slug: PLAN_BUSINESS };
			expect(
				stepsForProductAndSurvey( survey, product, false, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should include happychat step if product is business plan but happychat is not available (2y)', () => {
			const product = { product_slug: PLAN_BUSINESS_2_YEARS };
			expect(
				stepsForProductAndSurvey( survey, product, false, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );
	} );

	describe( 'question one answer is not "could not install" and precancellation chat turned "Off"', () => {
		const survey = { questionOneRadio: 'tooHard' };
		const precancellationChatToggle = false;

		test( 'should not include happychat step if product is personal plan and happychat is available', () => {
			const product = { product_slug: PLAN_PERSONAL };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should not include happychat step if product is personal plan and happychat is available (2y)', () => {
			const product = { product_slug: PLAN_PERSONAL_2_YEARS };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should not include happychat step if product is premium plan and happychat is available', () => {
			const product = { product_slug: PLAN_PREMIUM };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should not include happychat step if product is premium plan and happychat is available (2y)', () => {
			const product = { product_slug: PLAN_PREMIUM_2_YEARS };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should not include happychat step if product is business plan and happychat is available', () => {
			const product = { product_slug: PLAN_BUSINESS };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );

		test( 'should not include happychat step if product is business plan and happychat is available (2y)', () => {
			const product = { product_slug: PLAN_BUSINESS_2_YEARS };
			expect(
				stepsForProductAndSurvey( survey, product, true, precancellationChatToggle )
			).to.deep.equal( PLAN_SURVEY_STEPS );
		} );
	} );

	describe( 'question one answer is "could not install"', () => {
		const survey = { questionOneRadio: 'couldNotInstall' };

		test( 'should include AT upgrade step if product is personal plan', () => {
			const product = { product_slug: PLAN_PERSONAL };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_UPGRADE_AT_STEP
			);
		} );

		test( 'should include AT upgrade step if product is personal plan (2y)', () => {
			const product = { product_slug: PLAN_PERSONAL_2_YEARS };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_UPGRADE_AT_STEP
			);
		} );

		test( 'should include AT upgrade step if product is premium plan', () => {
			const product = { product_slug: PLAN_PREMIUM };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_UPGRADE_AT_STEP
			);
		} );

		test( 'should include AT upgrade step if product is premium plan (2y)', () => {
			const product = { product_slug: PLAN_PREMIUM_2_YEARS };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_UPGRADE_AT_STEP
			);
		} );

		test( 'should include business AT step if product is personal plan', () => {
			const product = { product_slug: PLAN_BUSINESS };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_BUSINESS_AT_STEP
			);
		} );

		test( 'should include business AT step if product is personal plan (2y)', () => {
			const product = { product_slug: PLAN_BUSINESS_2_YEARS };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_BUSINESS_AT_STEP
			);
		} );
	} );
} );
