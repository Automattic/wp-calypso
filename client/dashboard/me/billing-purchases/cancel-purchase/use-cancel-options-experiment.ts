import { isEnabled } from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import { isDotcomPlan } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

const EXPERIMENT_NAME = 'calypso_cancel_options_cards_202611_v1';

export interface CancelOptionsExperiment {
	isLoading: boolean;
	showCards: boolean;
}

// Teardown: everything for this experiment falls out of `grep -rEi 'cancel[-_]?options' client/ config/`.
export function useCancelOptionsExperiment(
	purchase: Purchase,
	isAtSurvey: boolean
): CancelOptionsExperiment {
	const isForced = isEnabled( 'purchases/cancel-options-cards' );
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: isDotcomPlan( purchase ) && isAtSurvey && ! isForced,
	} );

	if ( isForced ) {
		return { isLoading: false, showCards: true };
	}
	return { isLoading, showCards: assignment?.variationName === 'new_flow' };
}
