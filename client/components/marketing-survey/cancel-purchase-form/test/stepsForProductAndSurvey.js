jest.mock( 'lib/abtest', () => ( { abtest: require( 'sinon' ).stub() } ) );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import * as plans from 'lib/plans/constants';
import * as steps from '../steps';
import stepsForProductAndSurvey from '../stepsForProductAndSurvey';

const DEFAULT_STEPS = [ steps.INITIAL_STEP, steps.FINAL_STEP ];
const DEFAULT_STEPS_WITH_HAPPYCHAT = [ steps.INITIAL_STEP, steps.HAPPYCHAT_STEP, steps.FINAL_STEP ];
const DEFAULT_STEPS_WITH_CONCIERGE = [ steps.INITIAL_STEP, steps.CONCIERGE_STEP, steps.FINAL_STEP ];
const DEFAULT_STEPS_WITH_UPGRADE_AT_STEP = [ steps.INITIAL_STEP, steps.UPGRADE_AT_STEP, steps.FINAL_STEP ];
const DEFAULT_STEPS_WITH_BUSINESS_AT_STEP = [ steps.INITIAL_STEP, steps.BUSINESS_AT_STEP, steps.FINAL_STEP ];

describe( 'stepsForProductAndSurvey', function() {
	it( 'should return default steps if no state or product', function() {
		expect( stepsForProductAndSurvey() ).to.deep.equal( DEFAULT_STEPS );
	} );

	describe( 'question one answer is "too hard"', function() {
		const survey = { questionOneRadio: 'tooHard' };

		it( 'should include happychat step if product is personal plan and happychat is available', function() {
			const product = { product_slug: plans.PLAN_PERSONAL };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		it( 'should not include happychat step if product is personal plan but happychat is not available', function() {
			const product = { product_slug: plans.PLAN_PERSONAL };
			expect( stepsForProductAndSurvey( survey, product, false ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		it( 'should include happychat step if product is premium plan and happychat is available', function() {
			const product = { product_slug: plans.PLAN_PREMIUM };
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS_WITH_HAPPYCHAT );
		} );

		it( 'should not include happychat step if product is premium plan but happychat is not available', function() {
			const product = { product_slug: plans.PLAN_PREMIUM };
			expect( stepsForProductAndSurvey( survey, product, false ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		it( 'should include concierge step if product is business plan', function() {
			const product = { product_slug: plans.PLAN_BUSINESS };
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( DEFAULT_STEPS_WITH_CONCIERGE );
		} );

		it( 'should not include concierge step if product is jetpack business plan', function() {
			const product = { product_slug: plans.PLAN_JETPACK_BUSINESS };
			expect( stepsForProductAndSurvey( survey, product ) ).to.deep.equal( DEFAULT_STEPS );
		} );
	} );

	describe( 'question one answer is "could not install"', function() {
		const survey = { questionOneRadio: 'couldNotInstall' };

		it( 'should include AT upgrade step if product is personal plan and abtest variant is show', function() {
			const product = { product_slug: plans.PLAN_PERSONAL };
			abtest.withArgs( 'ATUpgradeOnCancel' ).returns( 'show' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS_WITH_UPGRADE_AT_STEP );
		} );

		it( 'should not include AT upgrade step if product is personal plan and abtest variant is hide', function() {
			const product = { product_slug: plans.PLAN_PERSONAL };
			abtest.withArgs( 'ATUpgradeOnCancel' ).returns( 'hide' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		it( 'should include AT upgrade step if product is premium plan and abtest variant is show', function() {
			const product = { product_slug: plans.PLAN_PREMIUM };
			abtest.withArgs( 'ATUpgradeOnCancel' ).returns( 'show' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS_WITH_UPGRADE_AT_STEP );
		} );

		it( 'should not include AT upgrade step if product is premium plan and abtest variant is hide', function() {
			const product = { product_slug: plans.PLAN_PREMIUM };
			abtest.withArgs( 'ATUpgradeOnCancel' ).returns( 'hide' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS );
		} );

		it( 'should include business AT step if product is personal plan and abtest variant is show', function() {
			const product = { product_slug: plans.PLAN_BUSINESS };
			abtest.withArgs( 'ATPromptOnCancel' ).returns( 'show' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS_WITH_BUSINESS_AT_STEP );
		} );

		it( 'should not include business AT step if product is business plan and abtest variant is hide', function() {
			const product = { product_slug: plans.PLAN_BUSINESS };
			abtest.withArgs( 'ATPromptOnCancel' ).returns( 'hide' );
			expect( stepsForProductAndSurvey( survey, product, true ) ).to.deep.equal( DEFAULT_STEPS );
		} );
	} );
} );
