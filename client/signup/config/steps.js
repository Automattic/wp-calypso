import {
	addAddOnsToCart,
	addPlanToCart,
	addWithThemePlanToCart,
	createAccount,
	createSite,
	createWpForTeamsSite,
	createSiteOrDomain,
	createSiteWithCart,
	setDesignOnSite,
	setThemeOnSite,
	setOptionsOnSite,
	setStoreFeatures,
	setIntentOnSite,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isAddOnsFulfilled,
	isDomainFulfilled,
	maybeRemoveStepForUserlessCheckout,
	createSiteAndAddDIFMToCart,
	excludeStepIfEmailVerified,
	submitWebsiteContent,
	excludeStepIfProfileComplete,
} from 'calypso/lib/signup/step-actions';
import { generateSteps } from './steps-pure';

export default generateSteps( {
	addAddOnsToCart,
	addPlanToCart,
	addWithThemePlanToCart,
	createAccount,
	createSite,
	createWpForTeamsSite,
	createSiteOrDomain,
	createSiteWithCart,
	setDesignOnSite,
	setThemeOnSite,
	setOptionsOnSite,
	setStoreFeatures,
	setIntentOnSite,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isAddOnsFulfilled,
	isDomainFulfilled,
	maybeRemoveStepForUserlessCheckout,
	createSiteAndAddDIFMToCart,
	excludeStepIfEmailVerified,
	excludeStepIfProfileComplete,
	submitWebsiteContent,
} );
