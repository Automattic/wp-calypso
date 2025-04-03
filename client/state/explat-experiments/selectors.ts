import { REMOVE_DUPLICATE_VIEWS_EXPERIMENT_OVERRIDE } from 'calypso/lib/remove-duplicate-views-experiment';
import { getPreference } from 'calypso/state/preferences/selectors';
import { AppState } from 'calypso/types';

import 'calypso/state/explat-experiments/init';

export const getIsExperimentEnabled = ( state: AppState, experimentName: string ) =>
	state.explatExperiments.experimentAssignments[ experimentName ] === 'treatment';

export const getIsRemoveDuplicateViewsExperimentEnabled = () => true;

export const getIsRemoveDuplicateViewsExperimentOverride = ( state: AppState ) =>
	getPreference( state, REMOVE_DUPLICATE_VIEWS_EXPERIMENT_OVERRIDE );
