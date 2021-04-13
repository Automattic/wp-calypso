/**
 * Internal dependencies
 */
import { SWITCH_PLAN_SIDES_EXPERIMENT, SWITCH_PLAN_SIDES_TREATMENT } from '../experiments';
import { getVariationForUser } from 'calypso/state/experiments/selectors';
import type { AppState } from 'calypso/types';

export const getWithPlanSidesTreatment = ( state: AppState ) => {
	const switchPlanSides = getVariationForUser( state, SWITCH_PLAN_SIDES_EXPERIMENT ) || '';
	return switchPlanSides === SWITCH_PLAN_SIDES_TREATMENT;
};
