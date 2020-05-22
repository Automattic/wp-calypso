/**
 * External dependencies
 */

import { current as currentPage } from 'page';

/**
 * Internal dependencies
 */
import {
	addPlanToCart,
	addSitelessPlanToCart,
	createAccount,
	createSite,
	createWpForTeamsSite,
	createSiteOrDomain,
	addDomainToSitelessCart,
	createSiteWithCart,
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
	addSitelessPlanToCart,
	createAccount,
	createSite,
	createWpForTeamsSite,
	createSiteOrDomain,
	addDomainToSitelessCart,
	createSiteWithCart,
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
