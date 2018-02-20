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
const JETPACK_PAID_PLANS = [
	plans.PLAN_JETPACK_BUSINESS,
	plans.PLAN_JETPACK_BUSINESS_MONTHLY,
	plans.PLAN_JETPACK_PERSONAL,
	plans.PLAN_JETPACK_PERSONAL_MONTHLY,
	plans.PLAN_JETPACK_PREMIUM,
	plans.PLAN_JETPACK_PREMIUM_MONTHLY,
];

export default function stepsForProductAndSurvey(
	survey,
	product,
	canChat,
	precancellationChatAvailable
) {
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

	if (
		canChat &&
		( includesProduct( BUSINESS_PLANS, product ) ||
			includesProduct( PERSONAL_PREMIUM_PLANS, product ) ) &&
		precancellationChatAvailable
	) {
		return steps.DEFAULT_STEPS_WITH_HAPPYCHAT;
	}

	if ( canChat && includesProduct( JETPACK_PAID_PLANS, product ) ) {
		return steps.DEFAULT_STEPS_WITH_HAPPYCHAT;
	}

	return [ steps.INITIAL_STEP, steps.FINAL_STEP ];
}
