import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';

const useSiteIntent = () => {
	const [ siteIntent, setSiteIntent ] = useState( '' );

	useEffect( () => {
		fetchSiteIntent();
	} );

	function fetchSiteIntent() {
		apiFetch( { path: '/wpcom/v2/site-intent' } )
			.then( ( result ) => setSiteIntent( result.site_intent ) )
			.catch( () => setSiteIntent( '' ) );
	}

	return siteIntent;
};
export default useSiteIntent;
