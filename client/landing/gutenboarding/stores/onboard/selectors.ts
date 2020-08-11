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
export const getDomainSearch = ( state: State ) =>
	state.domainSearch || getSelectedSiteTitle( state );
export const getPlan = ( state: State ) => state.plan;
export const getSelectedFeatures = ( state: State ) => state.selectedFeatures;
export const wasVerticalSkipped = ( state: State ): boolean => state.wasVerticalSkipped;
