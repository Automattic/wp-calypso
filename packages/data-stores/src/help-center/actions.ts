export const setShowHelpCenter = ( show: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_SHOW',
		show,
	} as const );

export type HelpCenterAction = ReturnType< typeof setShowHelpCenter >;
