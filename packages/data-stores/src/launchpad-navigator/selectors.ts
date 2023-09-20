import type { LaunchpadNavigatorState } from './reducer';

export const getActiveChecklistSlug = ( state: LaunchpadNavigatorState ) =>
	state.activeChecklistSlug;

export const getChecklistsSlug = ( state: LaunchpadNavigatorState ) => state.checklistsSlug;
