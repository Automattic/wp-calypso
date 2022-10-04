import { isGoodDefaultDomainQuery } from '@automattic/domain-utils';
import type { State } from './reducer';
export const getAnchorPodcastId = ( state: State ) => state.anchorPodcastId;
export const getAnchorEpisodeId = ( state: State ) => state.anchorEpisodeId;
export const getAnchorSpotifyUrl = ( state: State ) => state.anchorSpotifyUrl;
export const getIsRedirecting = ( state: State ) => state.isRedirecting;
export const getPlanProductId = ( state: State ) => state.planProductId;
export const getLastLocation = ( state: State ) => state.lastLocation;
export const getRandomizedDesigns = ( state: State ) => state.randomizedDesigns;
export const getSelectedDesign = ( state: State ) => state.selectedDesign;
export const getSelectedStyleVariation = ( state: State ) => state.selectedStyleVariation;
export const getSelectedDomain = ( state: State ) => state.domain;
export const getSelectedFeatures = ( state: State ) => state.selectedFeatures;
export const getSelectedFonts = ( state: State ) => state.selectedFonts;
export const getSelectedSite = ( state: State ) => state.selectedSite;
export const getSelectedSiteTitle = ( state: State ) => state.siteTitle;
export const getSelectedSiteLogo = ( state: State ) => state.siteLogo;
export const getSelectedSiteDescription = ( state: State ) => state.siteDescription;
export const getIntent = ( state: State ) => state.intent;
export const getStartingPoint = ( state: State ) => state.startingPoint;
export const getStoreType = ( state: State ) => state.storeType;
export const getPendingAction = ( state: State ) => state.pendingAction;
export const getProgress = ( state: State ) => state.progress;
export const getProgressTitle = ( state: State ) => state.progressTitle;
export const getStepProgress = ( state: State ) => state.stepProgress;
export const getGoals = ( state: State ) => state.goals;
export const getPatternContent = ( state: State ) => state.patternContent;
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

export const getEditEmail = ( state: State ) => state.editEmail;
