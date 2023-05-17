import { useEffect, useState } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';

const useSetupFormInitialValues = () => {
	const site = useSite();
	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );

	useEffect( () => {
		if ( site?.name || site?.description ) {
			setComponentSiteTitle( site?.name || '' );
			setTagline( site?.description || '' );
		}
	}, [ site?.name, site?.description ] );

	return {
		siteTitle,
		setComponentSiteTitle,
		tagline,
		setTagline,
	};
};

export default useSetupFormInitialValues;
