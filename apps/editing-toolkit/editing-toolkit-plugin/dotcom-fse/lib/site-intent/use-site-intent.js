import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import { useCallback } from 'react';

const useSiteIntent = () => {
	const [ siteIntent, setSiteIntent ] = useState( '' );

	const fetchSiteIntent = useCallback( () => {
		apiFetch( { path: '/wpcom/v2/site-intent' } )
			.then( ( result ) => setSiteIntent( result.site_intent ) )
			.catch( () => setSiteIntent( 'catch' ) );
	}, [] );

	useEffect( () => {
		fetchSiteIntent();
	}, [ fetchSiteIntent ] );

	return siteIntent;
};
export default useSiteIntent;
