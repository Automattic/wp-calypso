import type { State } from './reducer';

export const getAgentsManagerState = ( state: State ) => ( {
	isOpen: state.isOpen,
	isDocked: state.isDocked,
	agentsManagerRouterHistory: state.agentsManagerRouterHistory,
} );
export const getIsOpen = ( state: State ) => state.isOpen;
export const getIsDocked = ( state: State ) => state.isDocked;
export const getAgentsManagerRouterHistory = ( state: State ) => state.agentsManagerRouterHistory;
