import { useEffect, useState } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';

const useSetupFormInitialValues = () => {
	const site = useSite();
	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );
	const [ siteDataFetched, setSiteDataFetched ] = useState( false );

	useEffect( () => {
		if ( site && ! siteDataFetched ) {
			setComponentSiteTitle( site?.name || '' );
			setTagline( site?.description || '' );
			setSiteDataFetched( true );
		}
	}, [ site, siteDataFetched, setSiteDataFetched ] );

	return {
		siteTitle,
		setComponentSiteTitle,
		tagline,
		setTagline,
	};
};

export default useSetupFormInitialValues;
