import { useState, useEffect } from '@wordpress/element';
import { useCallback } from 'react';
import request from 'wpcom-proxy-request';

const useSitePlan = ( siteIdOrSlug ) => {
	const [ sitePlan, setSitePlan ] = useState();

	const fetchSite = useCallback( async () => {
		const siteObj = await request( {
			path: `/sites/${ siteIdOrSlug }?http_envelope=1`,
			apiNamespace: 'rest/v1.1',
		} );
		if ( siteObj?.plan ) {
			setSitePlan( siteObj.plan );
		}
	}, [ siteIdOrSlug ] );

	useEffect( () => {
		fetchSite();
	}, [ fetchSite ] );

	return sitePlan;
};
export default useSitePlan;
