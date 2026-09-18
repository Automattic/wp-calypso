import {
	addPlanToCart,
	addWithThemePlanToCart,
	addWithPluginPlanToCart,
	createAccount,
	createSiteOrDomain,
	createSiteWithCart,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isDomainFulfilled,
	maybeRemoveStepForUserlessCheckout,
	createSiteAndAddDIFMToCart,
	submitWebsiteContent,
} from 'calypso/lib/signup/step-actions';
import { generateSteps } from './steps-pure';

export default generateSteps( {
	addPlanToCart,
	addWithThemePlanToCart,
	addWithPluginPlanToCart,
	createAccount,
	createSiteOrDomain,
	createSiteWithCart,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isDomainFulfilled,
	maybeRemoveStepForUserlessCheckout,
	createSiteAndAddDIFMToCart,
	submitWebsiteContent,
} );
