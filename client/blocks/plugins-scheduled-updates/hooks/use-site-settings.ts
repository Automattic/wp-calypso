import { SiteSettings } from '@automattic/data-stores';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestSiteSettings } from 'calypso/state/site-settings/actions';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import getSiteId from 'calypso/state/sites/selectors/get-site-id';
import { SiteSlug } from 'calypso/types';

export function useSiteSettings( siteSlug?: SiteSlug ) {
	const dispatch = useDispatch();
	const siteId = useSelector( ( state ) => getSiteId( state, siteSlug! ) );
	const settings = useSelector( ( state ) => siteId && getSiteSettings( state, siteId ) ) as
		| SiteSettings
		| undefined;

	// Dispatch action to request the site settings.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestSiteSettings( siteId ) );
	}, [ dispatch, siteId ] );

	function getSiteSetting( option: string ): any {
		if ( ! settings || Object.keys( settings ).length === 0 ) {
			return '';
		}

		return settings[ option ] || '';
	}

	return { getSiteSetting };
}
