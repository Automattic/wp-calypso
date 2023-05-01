import { useEffect, useState } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';

const useSetupFormInitialValues = () => {
	const site = useSite();
	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );
	const [ paidSubscribers, setPaidSubscribers ] = useState( false );

	useEffect( () => {
		if ( site?.name || site?.description ) {
			setComponentSiteTitle( site?.name || '' );
			setTagline( site?.description || '' );
		}

		// @TODO: pull goals && set paid subscribers truthy if need
	}, [ site?.name, site?.description ] );

	return {
		siteTitle,
		setComponentSiteTitle,
		tagline,
		setTagline,
		paidSubscribers,
		setPaidSubscribers,
	};
};

export default useSetupFormInitialValues;
