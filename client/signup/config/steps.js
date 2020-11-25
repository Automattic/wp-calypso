/**
 * External dependencies
 */

import { current as currentPage } from 'page';

/**
 * Internal dependencies
 */
import {
	addPlanToCart,
	createAccount,
	createSite,
	createWpForTeamsSite,
	createSiteOrDomain,
	createSiteWithCart,
	setThemeOnSite,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isFreePlansDomainUpselFulfilled,
	isDomainFulfilled,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	maybeRemoveStepForUserlessCheckout,
	isSecureYourBrandFulfilled,
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
	setThemeOnSite,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isFreePlansDomainUpselFulfilled,
	isDomainFulfilled,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	maybeRemoveStepForUserlessCheckout,
	isSecureYourBrandFulfilled,
} );

export function isDomainStepSkippable( flowName ) {
	return flowName === 'test-fse';
}
