/** @format */
/**
 * Internal dependencies
 */
import * as plans from 'lib/plans/constants';
import { includesProduct } from 'lib/products-values';
import { abtest } from 'lib/abtest';
import * as steps from './steps';

const BUSINESS_PLANS = [ plans.PLAN_BUSINESS ];
const PERSONAL_PREMIUM_PLANS = [ plans.PLAN_PERSONAL, plans.PLAN_PREMIUM ];

export default function stepsForProductAndSurvey( survey, product, canChat ) {
	if ( survey && survey.questionOneRadio === 'tooHard' ) {
		if ( includesProduct( BUSINESS_PLANS, product ) ) {
			return [ steps.INITIAL_STEP, steps.CONCIERGE_STEP, steps.FINAL_STEP ];
		}

		if ( canChat && includesProduct( PERSONAL_PREMIUM_PLANS, product ) ) {
			return [ steps.INITIAL_STEP, steps.HAPPYCHAT_STEP, steps.FINAL_STEP ];
		}
	}

	if ( survey && survey.questionOneRadio === 'couldNotInstall' ) {
		if ( includesProduct( BUSINESS_PLANS, product ) && abtest( 'ATPromptOnCancel' ) === 'show' ) {
			return [ steps.INITIAL_STEP, steps.BUSINESS_AT_STEP, steps.FINAL_STEP ];
		}

		if (
			includesProduct( PERSONAL_PREMIUM_PLANS, product ) &&
			abtest( 'ATUpgradeOnCancel' ) === 'show'
		) {
			return [ steps.INITIAL_STEP, steps.UPGRADE_AT_STEP, steps.FINAL_STEP ];
		}
	}

	return [ steps.INITIAL_STEP, steps.FINAL_STEP ];
}
