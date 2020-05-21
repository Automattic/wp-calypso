const toggleSidebar = () =>
	( {
		type: 'TOGGLE_SIDEBAR',
	} as const );

export const actions = {
	toggleSidebar,
};

export type Action = ReturnType< typeof toggleSidebar >;
