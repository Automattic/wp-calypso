import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect, useCallback } from '@wordpress/element';

const useSiteIntent = () => {
	const [ siteIntent, setSiteIntent ] = useState( undefined );
	const [ siteIntentFetched, setSiteIntentFetched ] = useState( false );

	const fetchSiteIntent = useCallback( () => {
		apiFetch( { path: '/wpcom/v2/site-intent' } )
			.then( ( result ) => {
				setSiteIntent( result.site_intent );
				setSiteIntentFetched( true );
			} )
			.catch( () => {
				setSiteIntent( undefined );
				setSiteIntentFetched( true );
			} );
	}, [] );

	useEffect( () => {
		fetchSiteIntent();
	}, [ fetchSiteIntent ] );
	return { siteIntent, siteIntentFetched };
};
export default useSiteIntent;
