/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import * as steps from '../steps';
import stepsForProductAndSurvey from '../stepsForProductAndSurvey';
import { abtest } from 'client/lib/abtest';
import * as plans from 'client/lib/plans/constants';
jest.mock( 'lib/abtest', () => ( { abtest: require( 'sinon' ).stub() } ) );

const DEFAULT_STEPS = [ steps.INITIAL_STEP, steps.FINAL_STEP ];
const DEFAULT_STEPS_WITH_HAPPYCHAT = [ steps.INITIAL_STEP, steps.HAPPYCHAT_STEP, steps.FINAL_STEP ];
const DEFAULT_STEPS_WITH_CONCIERGE = [ steps.INITIAL_STEP, steps.CONCIERGE_STEP, steps.FINAL_STEP ];
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

describe( 'stepsForProductAndSurvey', () => {
	test( 'should return default steps if no state or product', () => {
		expect( stepsForProductAndSurvey() ).to.deep.equal( DEFAULT_STEPS );
	} );

	describe( 'question one answer is "too hard"', () => {
		const survey = { questionOneRadio: 'tooHard' };

		test( 'should include happychat step if product is personal plan and happychat is available', () => {
			const product = { product_slug: plans.PLAN_PERSONAL };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_HAPPYCHAT
			);
		} );

		test( 'should not include happychat step if product is personal plan but happychat is not available', () => {
			const product = { product_slug: plans.PLAN_PERSONAL };
			expect( stepsForProductAndSurvey( survey, product, false ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		test( 'should include happychat step if product is premium plan and happychat is available', () => {
			const product = { product_slug: plans.PLAN_PREMIUM };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_HAPPYCHAT
			);
		} );

		test( 'should not include happychat step if product is premium plan but happychat is not available', () => {
			const product = { product_slug: plans.PLAN_PREMIUM };
			expect( stepsForProductAndSurvey( survey, product, false ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		test( 'should include concierge step if product is business plan', () => {
			const product = { product_slug: plans.PLAN_BUSINESS };
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_CONCIERGE
			);
		} );

		test( 'should not include concierge step if product is jetpack business plan', () => {
			const product = { product_slug: plans.PLAN_JETPACK_BUSINESS };
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( DEFAULT_STEPS );
		} );
	} );

	describe( 'question one answer is "could not install"', () => {
		const survey = { questionOneRadio: 'couldNotInstall' };

		test( 'should include AT upgrade step if product is personal plan and abtest variant is show', () => {
			const product = { product_slug: plans.PLAN_PERSONAL };
			abtest.withArgs( 'ATUpgradeOnCancel' ).returns( 'show' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_UPGRADE_AT_STEP
			);
		} );

		test( 'should not include AT upgrade step if product is personal plan and abtest variant is hide', () => {
			const product = { product_slug: plans.PLAN_PERSONAL };
			abtest.withArgs( 'ATUpgradeOnCancel' ).returns( 'hide' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		test( 'should include AT upgrade step if product is premium plan and abtest variant is show', () => {
			const product = { product_slug: plans.PLAN_PREMIUM };
			abtest.withArgs( 'ATUpgradeOnCancel' ).returns( 'show' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_UPGRADE_AT_STEP
			);
		} );

		test( 'should not include AT upgrade step if product is premium plan and abtest variant is hide', () => {
			const product = { product_slug: plans.PLAN_PREMIUM };
			abtest.withArgs( 'ATUpgradeOnCancel' ).returns( 'hide' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		test( 'should include business AT step if product is personal plan and abtest variant is show', () => {
			const product = { product_slug: plans.PLAN_BUSINESS };
			abtest.withArgs( 'ATPromptOnCancel' ).returns( 'show' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal(
				DEFAULT_STEPS_WITH_BUSINESS_AT_STEP
			);
		} );

		test( 'should not include business AT step if product is business plan and abtest variant is hide', () => {
			const product = { product_slug: plans.PLAN_BUSINESS };
			abtest.withArgs( 'ATPromptOnCancel' ).returns( 'hide' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS );
		} );
	} );
} );
