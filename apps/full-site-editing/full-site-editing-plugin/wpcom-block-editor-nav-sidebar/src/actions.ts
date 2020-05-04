const receivePostList = ( response: any[] ) =>
	( {
		type: 'RECEIVE_POST_LIST',
		response,
	} as const );

const receivePostListFailed = ( error: object ) =>
	( {
		type: 'RECEIVE_POST_LIST_FAILED',
		error,
	} as const );

const toggleSidebar = () =>
	( {
		type: 'TOGGLE_SIDEBAR',
	} as const );

export const actions = {
	receivePostList,
	receivePostListFailed,
	toggleSidebar,
};

export type Action = ReturnType<
	typeof receivePostList | typeof receivePostListFailed | typeof toggleSidebar
>;
