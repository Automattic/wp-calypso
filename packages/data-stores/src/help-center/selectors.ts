import type { State } from './reducer';

export const isHelpCenterShown = ( state: State ) => state.showHelpCenter;
export const getSiteId = ( state: State ) => state.siteId;
export const getSubject = ( state: State ) => state.subject;
export const getMessage = ( state: State ) => state.message;
export const getOtherSiteURL = ( state: State ) => state.otherSiteURL;
export const getPopup = ( state: State ) => state.popup;
