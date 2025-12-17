import type { State } from './reducer';

export const getAgentsManagerState = ( state: State ) => ( {
	isOpen: state.isOpen,
	isDocked: state.isDocked,
	routerHistory: state.routerHistory,
	isLoading: state.isLoading,
	hasLoaded: state.hasLoaded,
	floatingPosition: state.floatingPosition,
} );
export const getIsOpen = ( state: State ) => state.isOpen;
export const getIsDocked = ( state: State ) => state.isDocked;
export const getRouterHistory = ( state: State ) => state.routerHistory;
export const getIsLoading = ( state: State ) => state.isLoading;
export const getHasLoaded = ( state: State ) => state.hasLoaded;
export const getFloatingPosition = ( state: State ) => state.floatingPosition;
