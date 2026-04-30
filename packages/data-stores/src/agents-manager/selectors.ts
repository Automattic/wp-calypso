import type { State } from './reducer';

export const getAgentsManagerState = ( state: State ) => ( {
	isOpen: state.isOpen,
	isDocked: state.isDocked,
	routerHistory: state.routerHistory,
	lastActivity: state.lastActivity,
	isLoading: state.isLoading,
	hasLoaded: state.hasLoaded,
	floatingPosition: state.floatingPosition,
	isSplitScreen: state.isSplitScreen,
} );
export const getIsOpen = ( state: State ) => state.isOpen;
export const getIsDocked = ( state: State ) => state.isDocked;
export const getIsSplitScreen = ( state: State ) => state.isSplitScreen;
export const getRouterHistory = ( state: State, siteKey: string ) => {
	if ( ! state.routerHistory ) {
		return undefined;
	}
	return state.routerHistory[ siteKey ];
};
export const getLastActivity = ( state: State, siteKey: string ) => {
	if ( ! state.lastActivity ) {
		return undefined;
	}
	return state.lastActivity[ siteKey ];
};
export const getIsLoading = ( state: State ) => state.isLoading;
export const getHasLoaded = ( state: State ) => state.hasLoaded;
export const getFloatingPosition = ( state: State ) => state.floatingPosition;
