/**
 * Internal dependencies
 */

import {
	GROUP_WPCOM,
	GROUP_JETPACK,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	findPlansKeys,
	isPlan,
	includesProduct,
} from '@automattic/calypso-products';
import * as steps from './steps';

const BUSINESS_PLANS = findPlansKeys( { group: GROUP_WPCOM, type: TYPE_BUSINESS } );
const PREMIUM_PLANS = findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PREMIUM } );
const PERSONAL_PREMIUM_PLANS = []
	.concat( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PERSONAL } ) )
	.concat( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PREMIUM } ) );

const JETPACK_PAID_PLANS = []
	.concat( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_PERSONAL } ) )
	.concat( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_PREMIUM } ) )
	.concat( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_BUSINESS } ) );

export default function stepsForProductAndSurvey(
	survey,
	product,
	canChat,
	precancellationChatAvailable,
	downgradePossible
) {
	if ( survey && survey.questionOneRadio === 'couldNotInstall' ) {
		if ( includesProduct( BUSINESS_PLANS, product ) ) {
			return [ steps.INITIAL_STEP, steps.BUSINESS_AT_STEP, steps.FINAL_STEP ];
		}

		if ( includesProduct( PERSONAL_PREMIUM_PLANS, product ) ) {
			return [ steps.INITIAL_STEP, steps.UPGRADE_AT_STEP, steps.FINAL_STEP ];
		}
	}

	if ( survey && survey.questionOneRadio === 'onlyNeedFree' ) {
		if ( includesProduct( PREMIUM_PLANS, product ) && downgradePossible ) {
			return [ steps.INITIAL_STEP, steps.DOWNGRADE_STEP, steps.FINAL_STEP ];
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

	if ( product && isPlan( product ) ) {
		return [ steps.INITIAL_STEP, steps.FINAL_STEP ];
	}

	return [ steps.FINAL_STEP ];
}
