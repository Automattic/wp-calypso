import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect, useCallback } from '@wordpress/element';

const useSiteIntent = () => {
	const [ siteIntent, setSiteIntent ] = useState( '' );

	const fetchSiteIntent = useCallback( () => {
		apiFetch( { path: '/wpcom/v2/site-intent' } )
			.then( ( result ) => setSiteIntent( result.site_intent ) )
			.catch( () => setSiteIntent( '' ) );
	}, [] );

	useEffect( () => {
		fetchSiteIntent();
	}, [ fetchSiteIntent ] );
	return siteIntent;
};
export default useSiteIntent;
