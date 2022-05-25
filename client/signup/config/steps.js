import { current as currentPage } from 'page';
import {
	addPlanToCart,
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
	isDomainFulfilled,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	maybeRemoveStepForUserlessCheckout,
	isNewOrExistingSiteFulfilled,
	setDIFMLiteDesign,
	excludeStepIfEmailVerified,
	excludeStepIfProfileComplete,
	excludeStepIfWorkspaceListEmpty,
	submitWebsiteContent,
} from 'calypso/lib/signup/step-actions';
import { generateSteps } from './steps-pure';

export default generateSteps( {
	addPlanToCart,
	createAccount,
	createSite,
	createWpForTeamsSite,
	createSiteOrDomain,
	createSiteWithCart,
	currentPage,
	setDesignOnSite,
	setThemeOnSite,
	setOptionsOnSite,
	setStoreFeatures,
	setIntentOnSite,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isDomainFulfilled,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	maybeRemoveStepForUserlessCheckout,
	isNewOrExistingSiteFulfilled,
	setDIFMLiteDesign,
	excludeStepIfEmailVerified,
	excludeStepIfProfileComplete,
	excludeStepIfWorkspaceListEmpty,
	submitWebsiteContent,
} );
