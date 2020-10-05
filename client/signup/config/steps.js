/**
 * External dependencies
 */

import { current as currentPage } from 'page';

/**
 * Internal dependencies
 */
import {
	addItemsToCart,
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
	isDomainFulfilled,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	maybeRemoveStepForUserlessCheckout,
	isSecureYourBrandFulfilled,
} from 'lib/signup/step-actions';
import { abtest } from 'lib/abtest';
import { generateSteps } from './steps-pure';

export default generateSteps( {
	addItemsToCart,
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
	isDomainFulfilled,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	maybeRemoveStepForUserlessCheckout,
	isSecureYourBrandFulfilled,
} );

export function isDomainStepSkippable( flowName ) {
	return (
		flowName === 'test-fse' ||
		( flowName === 'onboarding' && abtest( 'skippableDomainStep' ) === 'skippable' )
	);
}
