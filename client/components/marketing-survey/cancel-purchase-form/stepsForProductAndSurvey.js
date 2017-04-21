/**
 * Internal dependencies
 */
import {
	INITIAL_STEP,
	CONCIERGE_STEP,
	HAPPYCHAT_STEP,
	FINAL_STEP,
} from './steps';
import {
	isBusiness,
	isPersonal,
	isPremium,
} from 'lib/products-values';

export default function stepsForProductAndSurvey( survey, product ) {
	if ( survey && survey.questionOneRadio === 'tooHard' ) {
		if ( isBusiness( product ) ) {
			return [ INITIAL_STEP, CONCIERGE_STEP, FINAL_STEP ];
		}
		if ( isPersonal( product ) || isPremium( product ) ) {
			return [ INITIAL_STEP, HAPPYCHAT_STEP, FINAL_STEP ];
		}
	}

	return [ INITIAL_STEP, FINAL_STEP ];
}
