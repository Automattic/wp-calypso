import type { State } from './reducer';

export const isHelpCenterShown = ( state: State ) => state.showHelpCenter;
export const getSite = ( state: State ) => state.site;
export const getSubject = ( state: State ) => state.subject;
export const getMessage = ( state: State ) => state.message;
export const getUserDeclaredSiteUrl = ( state: State ) => state.userDeclaredSiteUrl;
export const getPopup = ( state: State ) => state.popup;
export const getUserDeclaredSite = ( state: State ) => state.userDeclaredSite;
