import { useEffect } from 'react';
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

	const selectedSite = useSite( postSignUpSiteSlugParam || postSignUpSiteIdParam );

	useEffect( () => {
		const signupDestinationCookieExists = retrieveSignupDestination();
		const isReEnteringFlow = getSignupCompleteFlowName() === 'onboarding';
		const isManageSiteFlow =
			wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow;

		if ( ! isManageSiteFlow ) {
			clearSignupDestinationCookie();
			return;
		}
	}, [] );

	if ( selectedSite ) {
		return {
			selectedSite,
			showExampleSuggestions: false,
			showSkipButton: true,
			includeWordPressDotCom: false,
		};
	}
	return {};
};
