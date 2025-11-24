import type { State } from './reducer';

export const getAgentsManagerState = ( state: State ) => ( {
	isOpen: state.isOpen,
	isDocked: state.isDocked,
	agentsManagerRouterHistory: state.agentsManagerRouterHistory,
	sessionId: state.sessionId,
	isLoading: state.isLoading,
	hasLoaded: state.hasLoaded,
} );
export const getIsOpen = ( state: State ) => state.isOpen;
export const getIsDocked = ( state: State ) => state.isDocked;
export const getAgentsManagerRouterHistory = ( state: State ) => state.agentsManagerRouterHistory;
export const getSessionId = ( state: State ) => state.sessionId;
export const getIsLoading = ( state: State ) => state.isLoading;
export const getHasLoaded = ( state: State ) => state.hasLoaded;
