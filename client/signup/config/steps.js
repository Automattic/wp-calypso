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
	setIntentOnSite,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isDomainFulfilled,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	maybeRemoveStepForUserlessCheckout,
	isNewOrExistingSiteFulfilled,
	setDesignIfNewSite,
	excludeStepIfEmailVerified,
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
	setIntentOnSite,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isDomainFulfilled,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	maybeRemoveStepForUserlessCheckout,
<<<<<<< HEAD
	isNewOrExistingSiteFulfilled,
	setDesignIfNewSite,
=======
	excludeStepIfEmailVerified,
>>>>>>> 3550da1e39 (Use isFulfilledStepCallback for skipping p2-confirm-email logic)
} );
