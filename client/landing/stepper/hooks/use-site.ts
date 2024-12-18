import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { getSite, isRequestingSite } from 'calypso/state/sites/selectors';
import { SITE_STORE } from '../stores';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';
import type { SiteSelect } from '@automattic/data-stores';

export function useSite( siteFragment?: number | string ) {
	const dispatch = useDispatch();
	const siteSlug = useSiteSlugParam();
	const siteIdParam = useSiteIdParam();
	const siteIdOrSlug = siteFragment ?? siteIdParam ?? siteSlug;

	const site = useSelect(
		( select ) => {
			const siteStore = select( SITE_STORE ) as SiteSelect;

			return siteIdOrSlug ? siteStore.getSite( siteIdOrSlug ) : null;
		},
		[ siteIdOrSlug ]
	);

	// Request the site for the redux store
	useEffect( () => {
		if ( siteIdOrSlug ) {
			dispatch( ( d, getState ) => {
				const state = getState();
				if ( getSite( state, siteIdOrSlug ) || isRequestingSite( state, siteIdOrSlug ) ) {
					return;
				}
				d( requestSite( siteIdOrSlug ) );
			} );
		}
	}, [ dispatch, siteIdOrSlug ] );

	if ( siteIdOrSlug && site ) {
		return site;
	}

	return null;
}
