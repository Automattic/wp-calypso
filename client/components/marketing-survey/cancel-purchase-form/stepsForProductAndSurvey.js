/**
 * Internal dependencies
 */
import {
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
} from 'lib/plans/constants';
import { includesProduct } from 'lib/products-values';
import { abtest } from 'lib/abtest';
import {
	INITIAL_STEP,
	CONCIERGE_STEP,
	HAPPYCHAT_STEP,
	FINAL_STEP,
} from './steps';

export default function stepsForProductAndSurvey( survey, product, canChat ) {
	if ( survey && survey.questionOneRadio === 'tooHard' ) {
		if ( includesProduct( [ PLAN_BUSINESS ], product ) && abtest( 'conciergeOfferOnCancel' ) === 'showConciergeOffer' ) {
			return [ INITIAL_STEP, CONCIERGE_STEP, FINAL_STEP ];
		}

		if ( canChat && includesProduct( [ PLAN_PERSONAL, PLAN_PREMIUM ], product ) && abtest( 'chatOfferOnCancel' ) === 'show' ) {
			return [ INITIAL_STEP, HAPPYCHAT_STEP, FINAL_STEP ];
		}
	}

	return [ INITIAL_STEP, FINAL_STEP ];
}
