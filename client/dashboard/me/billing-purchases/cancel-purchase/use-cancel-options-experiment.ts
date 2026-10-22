import { isEnabled } from '@automattic/calypso-config';

export interface CancelOptionsExperiment {
	isLoading: boolean;
	showCards: boolean;
}

/**
 * Gates the option cards shown after the cancel survey.
 *
 * Teardown: everything for this experiment falls out of `grep -rEi 'cancel[-_]?options' client/ config/`.
 */
export function useCancelOptionsExperiment(): CancelOptionsExperiment {
	return { isLoading: false, showCards: isEnabled( 'purchases/cancel-options-cards' ) };
}
