import type { State } from './reducer';

export const isHelpCenterShown = ( state: State ) => state.showHelpCenter;
export const getSite = ( state: State ) => state.site;
export const getSubject = ( state: State ) => state.subject;
export const getMessage = ( state: State ) => state.message;
export const getUserDeclaredSiteUrl = ( state: State ) => state.userDeclaredSiteUrl;
export const getIframe = ( state: State ) => state.iframe;
export const getDirectly = ( state: State ) => state.directlyData;
export const getUserDeclaredSite = ( state: State ) => state.userDeclaredSite;
