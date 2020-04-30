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

export const actions = {
	receivePageList,
	receivePageListFailed,
};

export type Action = ReturnType< typeof receivePageList | typeof receivePageListFailed >;
