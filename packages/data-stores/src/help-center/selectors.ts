import type { State } from './reducer';

export const isHelpCenterShown = ( state: State ) => state.showHelpCenter;

export const hasSeenWhatsNewModal = ( state: State ) => state.hasSeenWhatsNewModal;

export const hasFetchedHasSeenWhatsNewModal = ( state: State ) =>
	typeof state.hasSeenWhatsNewModal !== 'undefined';
