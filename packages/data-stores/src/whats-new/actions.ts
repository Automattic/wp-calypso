export const toggleModal = () =>
	( {
		type: 'TOGGLE_WHATS_NEW',
	} as const );

export const receiveWhatsNewList = ( list: string ) =>
	( {
		type: 'WHATS_NEW_LIST_RECEIVE',
		list,
	} as const );

export type Action = ReturnType< typeof toggleModal | typeof receiveWhatsNewList >;
