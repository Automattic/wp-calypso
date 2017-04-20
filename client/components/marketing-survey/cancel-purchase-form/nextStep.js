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
} from 'lib/product-values';

export default function nextStep( currentStep, survey, product ) {
	if ( currentStep === FINAL_STEP ) {
		return false;
	}

	if ( currentStep === INITIAL_STEP ) {
		if ( survey && survey.questionOneRadio === 'tooHard' ) {
			if ( isBusiness( product ) ) {
				return CONCIERGE_STEP;
			}
			if ( isPersonal( product ) || isPremium( product ) ) {
				return HAPPYCHAT_STEP;
			}
			return FINAL_STEP;
		}
		return FINAL_STEP;
	}

	return INITIAL_STEP;
}
