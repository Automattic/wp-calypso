export const setShowHelpCenter = ( show: boolean ) => {
	return {
		type: 'HELP_CENTER_SET_SHOW',
		show,
	};
};

export type HelpCenterAction = ReturnType< typeof setShowHelpCenter >;
