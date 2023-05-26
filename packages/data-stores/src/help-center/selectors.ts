import type { State } from './reducer';

export const isHelpCenterShown = ( state: State ) => state.showHelpCenter;
export const isMessagingLauncherShown = ( state: State ) => state.showMessagingLauncher;
export const isMessagingWidgetShown = ( state: State ) => state.showMessagingWidget;
export const isMessagingScriptLoaded = ( state: State ) => state.isMessagingScriptLoaded;
export const getSite = ( state: State ) => state.site;
export const getSubject = ( state: State ) => state.subject;
export const getMessage = ( state: State ) => state.message;
export const getChatTag = ( state: State ) => state.chatTag;
export const getUserDeclaredSiteUrl = ( state: State ) => state.userDeclaredSiteUrl;
export const getIframe = ( state: State ) => state.iframe;
export const getUserDeclaredSite = ( state: State ) => state.userDeclaredSite;
export const getUnreadCount = ( state: State ) => state.unreadCount;
export const getIsMinimized = ( state: State ) => state.isMinimized;
export const getHasSeenWhatsNewModal = ( state: State ) => state.hasSeenWhatsNewModal;
export const getInitialRoute = ( state: State ) => state.initialRoute;
