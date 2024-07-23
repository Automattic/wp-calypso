import type { State } from './reducer';

export const isHelpCenterShown = ( state: State ) => state.showHelpCenter;
export const isMessagingLauncherShown = ( state: State ) => state.showMessagingLauncher;
export const isMessagingWidgetShown = ( state: State ) => state.showMessagingWidget;
export const getSubject = ( state: State ) => state.subject;
export const getMessage = ( state: State ) => state.message;
export const getUserDeclaredSiteUrl = ( state: State ) => state.userDeclaredSiteUrl;
export const getUserDeclaredSite = ( state: State ) => state.userDeclaredSite;
export const getUnreadCount = ( state: State ) => state.unreadCount;
export const getIsMinimized = ( state: State ) => state.isMinimized;
export const getHasSeenWhatsNewModal = ( state: State ) => state.hasSeenWhatsNewModal;
export const getInitialRoute = ( state: State ) => state.initialRoute;
export const getNavigateToRoute = ( state: State ) => state.navigateToRoute;
