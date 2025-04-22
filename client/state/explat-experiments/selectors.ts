import { AppState } from 'calypso/types';

import 'calypso/state/explat-experiments/init';

export const getIsExperimentEnabled = ( state: AppState, experimentName: string ) =>
	state.explatExperiments.experimentAssignments[ experimentName ] === 'treatment';
