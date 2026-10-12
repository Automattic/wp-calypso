import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import {
	getSignupCompleteFlowName,
	getSignupCompleteSiteID,
	getSignupCompleteSlug,
	retrieveSignupDestination,
} from 'calypso/signup/storageUtils';
import { hasPurchaseStepsParameter } from '../../internals/steps-repository/components/onboarding-progress/use-show-onboarding-progress';

export function isPurchaseResume( query: URLSearchParams ): boolean {
	return (
		hasPurchaseStepsParameter( query ) &&
		!! query.get( 'siteSlug' ) &&
		!! query.get( 'siteId' ) &&
		query.get( 'siteSlug' ) === getSignupCompleteSlug() &&
		query.get( 'siteId' ) === getSignupCompleteSiteID() &&
		getSignupCompleteFlowName() === NEW_HOSTED_SITE_FLOW &&
		!! retrieveSignupDestination()
	);
}
