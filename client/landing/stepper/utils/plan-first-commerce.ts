import { isEcommercePlan, PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import {
	getSignupCompleteFlowName,
	getSignupCompleteSiteID,
	getSignupCompleteSlug,
	retrieveSignupDestination,
} from 'calypso/signup/storageUtils';

export function isPlanFirstCommerce( flow: string, query: URLSearchParams ): boolean {
	const plan = query.get( 'plan' );
	return (
		flow === NEW_HOSTED_SITE_FLOW &&
		query.get( 'plan_first' ) === 'true' &&
		query.has( 'showDomainStep' ) &&
		!! plan &&
		isEcommercePlan( plan ) &&
		plan !== PLAN_ECOMMERCE_TRIAL_MONTHLY
	);
}

export function isPlanFirstCommerceResume( flow: string, query: URLSearchParams ): boolean {
	return (
		isPlanFirstCommerce( flow, query ) &&
		!! query.get( 'siteSlug' ) &&
		!! query.get( 'siteId' ) &&
		query.get( 'siteSlug' ) === getSignupCompleteSlug() &&
		query.get( 'siteId' ) === getSignupCompleteSiteID() &&
		getSignupCompleteFlowName() === NEW_HOSTED_SITE_FLOW &&
		!! retrieveSignupDestination()
	);
}
