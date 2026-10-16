import {
	addPlanToCart,
	addWithThemePlanToCart,
	addWithPluginPlanToCart,
	createAccount,
	createSiteOrDomain,
	createSiteWithCart,
	isPlanFulfilled,
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
	isPlanFulfilled,
	maybeRemoveStepForUserlessCheckout,
	createSiteAndAddDIFMToCart,
	submitWebsiteContent,
} );
