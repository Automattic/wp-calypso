import { usePrevious } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { getSite, isRequestingSite } from 'calypso/state/sites/selectors';
import { SITE_STORE } from '../stores';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';
import type { SiteSelect } from '@automattic/data-stores';

export function useSite() {
	const dispatch = useDispatch();
	const siteSlug = useSiteSlugParam();
	const siteIdParam = useSiteIdParam();
	const siteIdOrSlug = siteIdParam ?? siteSlug ?? '';
	const selectedSite = useSelector( ( state ) => getSite( state, siteIdOrSlug ) );
	const isRequestingSelectedSite = useSelector( ( state ) =>
		isRequestingSite( state, siteIdOrSlug )
	);
	const lastRequestedSiteIdOrSlug = usePrevious( siteIdOrSlug );

	const site = useSelect(
		( select ) => {
			const siteStore = select( SITE_STORE ) as SiteSelect;

			return siteIdOrSlug ? siteStore.getSite( siteIdOrSlug ) : null;
		},
		[ siteIdOrSlug ]
	);

	// Request the site for the redux store
	useEffect( () => {
		if (
			siteIdOrSlug &&
			siteIdOrSlug !== lastRequestedSiteIdOrSlug &&
			! selectedSite &&
			! isRequestingSelectedSite
		) {
			dispatch( requestSite( siteIdOrSlug ) );
		}
	}, [ siteIdOrSlug, selectedSite, isRequestingSelectedSite ] );

	if ( siteIdOrSlug && site ) {
		return site;
	}

	return null;
}
