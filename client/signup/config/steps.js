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
	isDomainFulfilled,
	removeDomainStepForPaidPlans,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	addOrRemoveFromProgressStore,
} from 'lib/signup/step-actions';
import { abtest } from 'lib/abtest';
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
	isDomainFulfilled,
	removeDomainStepForPaidPlans,
	isSiteTypeFulfilled,
	isSiteTopicFulfilled,
	addOrRemoveFromProgressStore,
} );

export function isDomainStepSkippable( flowName ) {
	return (
		flowName === 'test-fse' ||
		flowName === 'onboarding-plan-first' ||
		( flowName === 'onboarding' && abtest( 'skippableDomainStep' ) === 'skippable' )
	);
}
