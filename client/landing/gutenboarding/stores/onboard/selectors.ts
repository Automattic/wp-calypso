import { isGoodDefaultDomainQuery } from '@automattic/domain-picker';
import type { State } from './reducer';

export const getIsRedirecting = ( state: State ) => state.isRedirecting;
export const getPlanProductId = ( state: State ) => state.planProductId;
export const getLastLocation = ( state: State ) => state.lastLocation;
export const getRandomizedDesigns = ( state: State ) => state.randomizedDesigns;
export const getSelectedDesign = ( state: State ) => state.selectedDesign;
export const getSelectedDomain = ( state: State ) => state.domain;
export const getSelectedFeatures = ( state: State ) => state.selectedFeatures;
export const getSelectedFonts = ( state: State ) => state.selectedFonts;
export const getSelectedSite = ( state: State ) => state.selectedSite;
export const getSelectedSiteTitle = ( state: State ) => state.siteTitle;
export const getState = ( state: State ) => state;
export const hasPaidDesign = ( state: State ): boolean => {
	if ( ! state.selectedDesign ) {
		return false;
	}
	return state.selectedDesign.is_premium;
};
export const hasPaidDomain = ( state: State ): boolean => {
	if ( ! state.domain ) {
		return false;
	}
	return ! state.domain.is_free;
};
export const hasSiteTitle = ( state: State ) => state.siteTitle.trim().length > 1; // for valid domain results, we need at least 2 characters

// Selectors dependent on other selectors (cannot be put in alphabetical order)
export const getDomainSearch = ( state: State ) =>
	state.domainSearch ||
	( isGoodDefaultDomainQuery( getSelectedSiteTitle( state ) ) && getSelectedSiteTitle( state ) ) ||
	undefined;

export const hasSelectedDesign = ( state: State ) => !! state.selectedDesign;

export const hasSelectedDesignWithoutFonts = ( state: State ) =>
	hasSelectedDesign( state ) && ! state.selectedFonts;

export const isEnrollingInFseBeta = ( state: State ): boolean => state.isEnrollingInFseBeta;
