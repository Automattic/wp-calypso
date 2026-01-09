import type { State } from './reducer';

export const isHelpCenterShown = ( state: State ) => state.showHelpCenter;
export const isMessagingLauncherShown = ( state: State ) => state.showMessagingLauncher;
export const isMessagingWidgetShown = ( state: State ) => state.showMessagingWidget;
export const getSubject = ( state: State ) => state.subject;
export const getMessage = ( state: State ) => state.message;
export const getUserDeclaredSiteUrl = ( state: State ) => state.userDeclaredSiteUrl;
export const getUserDeclaredSite = ( state: State ) => state.userDeclaredSite;
export const getUnreadCount = ( state: State ) => state.unreadCount;
export const getZendeskConnectionStatus = ( state: State ) => state.zendeskConnectionStatus;
export const getIsMinimized = ( state: State ) => state.isMinimized;
export const getIsChatLoaded = ( state: State ) => state.isChatLoaded;
export const getLoggedOutOdieChat = ( state: State ) => state.loggedOutOdieChat;
export const getAreSoundNotificationsEnabled = ( state: State ) =>
	state.areSoundNotificationsEnabled;
export const getZendeskClientId = ( state: State ) => state.zendeskClientId;
export const getHelpCenterRouterHistory = ( state: State ) => state.helpCenterRouterHistory;
export const getNavigateToRoute = ( state: State ) => state.navigateToRoute;
export const getOdieInitialPromptText = ( state: State ) => state.odieInitialPromptText;
export const getOdieBotNameSlug = ( state: State ) => state.odieBotNameSlug;
export const getHasPremiumSupport = ( state: State ) => state.hasPremiumSupport;
export const getHelpCenterOptions = ( state: State ) => state.helpCenterOptions;
export const getContextTerm = ( state: State ) => state.contextTerm;
export const getSupportTypingStatus = ( state: State, conversationId: string ) =>
	state.typingConversationStatus?.[ conversationId ];
