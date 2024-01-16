import { DomainTransferData } from './types';
import type { State } from './reducer';
/**
 * Merge persisted domain names with unpersisted auth codes.
 * We don't want to persist auth codes due to their sensitive nature.
 * @param state
 * @returns
 */
export const getBulkDomainsData = ( state: State ) => {
	if ( ! state.domainTransferNames ) {
		return undefined;
	}
	const domainTransferData: DomainTransferData = {};
	for ( const key in state.domainTransferNames ) {
		domainTransferData[ key ] = {
			domain: state.domainTransferNames[ key ],
			auth: state.domainTransferAuthCodes?.[ key ].auth ?? '',
			valid: state.domainTransferAuthCodes?.[ key ].valid ?? false,
			rawPrice: state.domainTransferAuthCodes?.[ key ].rawPrice ?? 0,
			saleCost: state.domainTransferAuthCodes?.[ key ].saleCost,
			currencyCode: state.domainTransferAuthCodes?.[ key ].currencyCode ?? 'USD',
		};
	}
	return domainTransferData;
};
export const getPlanCartItem = ( state: State ) => state.planCartItem;
export const getProductCartItems = ( state: State ) => state.productCartItems;
export const getSelectedDesign = ( state: State ) => state.selectedDesign;
export const getSelectedStyleVariation = ( state: State ) => state.selectedStyleVariation;
export const getSelectedDomain = ( state: State ) => state.domain;
export const getSelectedFeatures = ( state: State ) => state.selectedFeatures;
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
export const getGoals = ( state: State ) => state.goals;
export const getStoreLocationCountryCode = ( state: State ) => state.storeLocationCountryCode;
export const getEcommerceFlowRecurType = ( state: State ) => state.ecommerceFlowRecurType;
export const getCouponCode = ( state: State ) => state.couponCode;
export const getState = ( state: State ) => state;
export const hasPaidDesign = ( state: State ): boolean => {
	if ( ! state.selectedDesign ) {
		return false;
	}
	return state.selectedDesign.is_premium;
};
export const hasSiteTitle = ( state: State ) => state.siteTitle.trim().length > 1; // for valid domain results, we need at least 2 characters

// Selectors dependent on other selectors (cannot be put in alphabetical order)
export const hasSelectedDesign = ( state: State ) => !! state.selectedDesign;

export const getDomainForm = ( state: State ) => state.domainForm;
export const getDomainCartItem = ( state: State ) => state.domainCartItem;
export const getHideFreePlan = ( state: State ) => state.hideFreePlan;
export const getHidePlansFeatureComparison = ( state: State ) => state.hidePlansFeatureComparison;
export const getIsMigrateFromWp = ( state: State ) => state.isMigrateFromWp;
export const getPluginsToVerify = ( state: State ) => state.pluginsToVerify;
export const getProfilerData = ( state: State ) => state.profilerData;
export const getPaidSubscribers = ( state: State ) => state.paidSubscribers;
