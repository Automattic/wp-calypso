export const setCurrentChecklist = ( currentChecklist: string ) =>
	( {
		type: 'LAUNCHPAD_NAVIGATOR_SET_CURRENT_CHECKLIST',
		current_checklist: currentChecklist,
	} as const );

export type LaunchpadNavigatorAction = ReturnType< typeof setCurrentChecklist >;
