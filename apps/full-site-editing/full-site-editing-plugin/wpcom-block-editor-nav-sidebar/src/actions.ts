const receivePageList = ( response: any[] ) =>
	( {
		type: 'RECEIVE_PAGE_LIST',
		response,
	} as const );

const receivePageListFailed = ( error: object ) =>
	( {
		type: 'RECEIVE_PAGE_LIST_FAILED',
		error,
	} as const );

const toggleSidebar = () =>
	( {
		type: 'TOGGLE_SIDEBAR',
	} as const );

export const actions = {
	receivePageList,
	receivePageListFailed,
	toggleSidebar,
};

export type Action = ReturnType<
	typeof receivePageList | typeof receivePageListFailed | typeof toggleSidebar
>;
