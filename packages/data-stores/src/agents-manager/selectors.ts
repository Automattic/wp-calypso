import type { State } from './reducer';

export const getAgentsManagerState = ( state: State ) => ( {
	isOpen: state.isOpen,
	isDocked: state.isDocked,
	isMinimized: state.isMinimized,
	// Minimized counts as hidden even though the chat stays open.
	isChatVisible: state.isOpen && ! state.isMinimized,
	isLoading: state.isLoading,
	hasLoaded: state.hasLoaded,
	floatingPosition: state.floatingPosition,
	freeDragPosition: state.freeDragPosition,
	floatingSize: state.floatingSize,
	isSplitScreen: state.isSplitScreen,
} );
export const getIsOpen = ( state: State ) => state.isOpen;
export const getIsDocked = ( state: State ) => state.isDocked;
export const getIsMinimized = ( state: State ) => state.isMinimized;
export const getIsSplitScreen = ( state: State ) => state.isSplitScreen;
export const getIsLoading = ( state: State ) => state.isLoading;
export const getHasLoaded = ( state: State ) => state.hasLoaded;
export const getFloatingPosition = ( state: State ) => state.floatingPosition;
export const getFreeDragPosition = ( state: State ) => state.freeDragPosition;
export const getFloatingSize = ( state: State ) => state.floatingSize;
