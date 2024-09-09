import { useEffect, useState } from 'react';
import {
	getSignupCompleteFlowName,
	retrieveSignupDestination,
	wasSignupCheckoutPageUnloaded,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const useIsManagedSiteFlowProps = () => {
	const [ props, setProps ] = useState( {} );
	const selectedSiteData = useSelector( getSelectedSite );

	useEffect( () => {
		const signupDestinationCookieExists = retrieveSignupDestination();
		const isReEnteringFlow = getSignupCompleteFlowName() === 'onboarding';
		const isManageSiteFlow =
			wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow;
		clearSignupDestinationCookie();

		if ( isManageSiteFlow && selectedSiteData ) {
			setProps( {
				showExampleSuggestions: false,
				showSkipButton: true,
				includeWordPressDotCom: false,
			} );
		}
	}, [ selectedSiteData ] );

	return props;
};
