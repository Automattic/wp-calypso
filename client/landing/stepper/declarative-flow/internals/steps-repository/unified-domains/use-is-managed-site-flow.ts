import { useEffect, useMemo } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import {
	getSignupCompleteFlowName,
	retrieveSignupDestination,
	wasSignupCheckoutPageUnloaded,
	clearSignupDestinationCookie,
	getSignupCompleteSlug,
	getSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';

export const useIsManagedSiteFlowProps = () => {
	const postSignUpSiteSlugParam = getSignupCompleteSlug();
	const postSignUpSiteIdParam = getSignupCompleteSiteID();
	const isManageSiteFlow = useMemo( () => {
		return (
			wasSignupCheckoutPageUnloaded() &&
			retrieveSignupDestination() &&
			getSignupCompleteFlowName() === 'onboarding'
		);
	}, [] );

	const selectedSite = useSite( postSignUpSiteSlugParam || postSignUpSiteIdParam );

	useEffect( () => {
		if ( ! isManageSiteFlow ) {
			clearSignupDestinationCookie();
			return;
		}
	}, [ isManageSiteFlow ] );

	if ( selectedSite && isManageSiteFlow ) {
		return {
			selectedSite,
			showExampleSuggestions: false,
			showSkipButton: true,
			includeWordPressDotCom: false,
		};
	}
	return {};
};
