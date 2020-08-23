/**
 * Internal dependencies
 */
import type { State } from './reducer';

export const getIsRedirecting = ( state: State ) => state.isRedirecting;
export const getState = ( state: State ) => state;
export const getSelectedSite = ( state: State ) => state.selectedSite;
export const hasPaidDomain = ( state: State ): boolean => {
	if ( ! state.domain ) {
		return false;
	}
	return ! state.domain.is_free;
};
export const hasPaidDesign = ( state: State ): boolean => {
	if ( ! state.selectedDesign ) {
		return false;
	}
	return state.selectedDesign.is_premium;
};
export const getSelectedDesign = ( state: State ) => state.selectedDesign;
export const getSelectedFonts = ( state: State ) => state.selectedFonts;
export const getSelectedVertical = ( state: State ) => state.siteVertical;
export const getSelectedDomain = ( state: State ) => state.domain;
export const getSelectedSiteTitle = ( state: State ) => state.siteTitle;
export const hasSiteTitle = ( state: State ) => state.siteTitle.trim().length > 1; // for valid domain results, we need at least 2 characters
export const getDomainSearch = ( state: State ) =>
	state.domainSearch || getSelectedSiteTitle( state ) || getSelectedVertical( state )?.label;
export const getPlan = ( state: State ) => state.plan;
export const getSelectedFeatures = ( state: State ) => state.selectedFeatures;
export const wasVerticalSkipped = ( state: State ): boolean => state.wasVerticalSkipped;
export const getRandomizedDesigns = ( state: State ) => state.randomizedDesigns;
