/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getSelectedPlan = ( state: State ) => state.selectedPlan;
export const getSupportedPlans = ( state: State ) => state.supportedPlans;
