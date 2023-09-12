import type { LaunchpadNavigatorState } from './reducer';

export const getActiveChecklistSlug = ( state: LaunchpadNavigatorState ) =>
	state.activeChecklistSlug;
