import { useEffect, useState } from 'react';
import {
	getSignupCompleteFlowName,
	retrieveSignupDestination,
	wasSignupCheckoutPageUnloaded,
	clearSignupDestinationCookie,
	getSignupCompleteSlug,
} from 'calypso/signup/storageUtils';

export const useIsManagedSiteFlowProps = () => {
	const [ props, setProps ] = useState( {} );
	const signupSlug = getSignupCompleteSlug();

	useEffect( () => {
		const signupDestinationCookieExists = retrieveSignupDestination();
		const isReEnteringFlow = getSignupCompleteFlowName() === 'onboarding';
		const isManageSiteFlow =
			wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow;

		if ( ! isManageSiteFlow ) {
			clearSignupDestinationCookie();
			return;
		}

		if ( signupSlug ) {
			return setProps( {
				selectedSite: { slug: signupSlug },
				showExampleSuggestions: false,
				showSkipButton: true,
				includeWordPressDotCom: false,
			} );
		}
	}, [ signupSlug ] );

	return props;
};
