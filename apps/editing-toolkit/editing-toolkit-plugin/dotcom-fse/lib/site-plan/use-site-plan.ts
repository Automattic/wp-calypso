import { SiteDetails } from '@automattic/data-stores/src/site';
import { SiteDetailsPlan } from '@automattic/launch/src/stores';
import { useState, useEffect } from '@wordpress/element';
import { useCallback } from 'react';
import request from 'wpcom-proxy-request';

const useSitePlan = ( siteIdOrSlug: string | number ) => {
	const [ sitePlan, setSitePlan ] = useState( {} as SiteDetailsPlan );

	const fetchSite = useCallback( async () => {
		const siteObj: SiteDetails = await request( {
			path: `/sites/${ siteIdOrSlug }?http_envelope=1`,
			apiVersion: '1.1',
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
