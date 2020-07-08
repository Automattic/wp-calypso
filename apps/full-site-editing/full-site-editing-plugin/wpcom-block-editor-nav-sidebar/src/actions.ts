const toggleSidebar = () =>
	( {
		type: 'TOGGLE_SIDEBAR',
	} as const );

const setSidebarClosing = ( isClosing: boolean ) =>
	( {
		type: 'SET_SIDEBAR_CLOSING',
		isClosing,
	} as const );

export const actions = {
	toggleSidebar,
	setSidebarClosing,
};

export type Action = ReturnType< typeof toggleSidebar | typeof setSidebarClosing >;
