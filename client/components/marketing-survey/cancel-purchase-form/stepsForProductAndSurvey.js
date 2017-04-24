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

export default function stepsForProductAndSurvey( survey, product ) {
	if ( survey && survey.questionOneRadio === 'tooHard' ) {
		if ( abtest( 'conciergeOfferOnCancel' ) === 'showConciergeOffer' && includesProduct( [ PLAN_BUSINESS ], product ) ) {
			return [ INITIAL_STEP, CONCIERGE_STEP, FINAL_STEP ];
		}
		if ( abtest( 'chatOfferOnCancel' ) === 'show' && includesProduct( [ PLAN_PERSONAL, PLAN_PREMIUM ], product ) ) {
			return [ INITIAL_STEP, HAPPYCHAT_STEP, FINAL_STEP ];
		}
	}

	return [ INITIAL_STEP, FINAL_STEP ];
}
