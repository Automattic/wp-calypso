/**
 * External dependencies
 */

import { current as currentPage } from 'page';

/**
 * Internal dependencies
 */
import {
	addDomainToCartWithoutSite,
	addPlanToCart,
	createAccount,
	createSite,
	createWpForTeamsSite,
	createSiteOrDomain,
	createSiteWithCart,
	addPlanToCartWithoutSite,
	setThemeOnSite,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isDomainFulfilled,
	removeDomainStepForPaidPlans,
	sitelessRemoveDomainStepForPaidPlans,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	addOrRemoveFromProgressStore,
} from 'lib/signup/step-actions';
import { abtest } from 'lib/abtest';
import { generateSteps } from './steps-pure';

export default generateSteps( {
	addPlanToCart,
	addDomainToCartWithoutSite,
	createAccount,
	createSite,
	createWpForTeamsSite,
	createSiteOrDomain,
	createSiteWithCart,
	addPlanToCartWithoutSite,
	currentPage,
	setThemeOnSite,
	addDomainToCart,
	launchSiteApi,
	isPlanFulfilled,
	isDomainFulfilled,
	removeDomainStepForPaidPlans,
	sitelessRemoveDomainStepForPaidPlans,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	addOrRemoveFromProgressStore,
} );

export function isDomainStepSkippable( flowName ) {
	return (
		flowName === 'test-fse' ||
		( flowName === 'onboarding' && abtest( 'skippableDomainStep' ) === 'skippable' )
	);
}
