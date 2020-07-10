/**
 * Internal dependencies
 */
import type { State } from './reducer';

export const getState = ( state: State ) => state;

export const hasPaidDomain = ( state: State ): boolean => {
	if ( ! state.domain ) {
		return false;
	}
	return ! state.domain.is_free;
};
export const getSelectedDomain = ( state: State ) => state.domain;
export const getSelectedPlan = ( state: State ) => state.plan;
