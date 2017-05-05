/**
 * Internal dependencies
 */
import * as plans from 'lib/plans/constants';
import { includesProduct } from 'lib/products-values';
import { abtest } from 'lib/abtest';
import * as steps from './steps';

const CONCIERGE_PLANS = [ plans.PLAN_BUSINESS ];
const HAPPYCHAT_PLANS = [ plans.PLAN_PERSONAL, plans.PLAN_PREMIUM ];

export default function stepsForProductAndSurvey( survey, product, canChat ) {
	if ( survey && survey.questionOneRadio === 'tooHard' ) {
		if ( includesProduct( CONCIERGE_PLANS, product ) ) {
			return [ steps.INITIAL_STEP, steps.CONCIERGE_STEP, steps.FINAL_STEP ];
		}

		if ( canChat && includesProduct( HAPPYCHAT_PLANS, product ) && abtest( 'chatOfferOnCancel' ) === 'show' ) {
			return [ steps.INITIAL_STEP, steps.HAPPYCHAT_STEP, steps.FINAL_STEP ];
		}
	}

	return [ steps.INITIAL_STEP, steps.FINAL_STEP ];
}
