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
export const getIsChatLoaded = ( state: State ) => state.isChatLoaded;
export const getAreSoundNotificationsEnabled = ( state: State ) =>
	state.areSoundNotificationsEnabled;
export const getZendeskClientId = ( state: State ) => state.zendeskClientId;
export const getHelpCenterRouterHistory = ( state: State ) => state.helpCenterRouterHistory;
export const getNavigateToRoute = ( state: State ) => state.navigateToRoute;
export const getOdieInitialPromptText = ( state: State ) => state.odieInitialPromptText;
export const getOdieBotNameSlug = ( state: State ) => state.odieBotNameSlug;
export const getCurrentSupportInteraction = ( state: State ) => state.currentSupportInteraction;
export const getAllowPremiumSupport = ( state: State ) => state.allowPremiumSupport;
export const getHelpCenterOptions = ( state: State ) => state.helpCenterOptions;
export const getContextTerm = ( state: State ) => state.contextTerm;
