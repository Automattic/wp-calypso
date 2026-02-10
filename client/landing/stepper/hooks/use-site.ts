import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { receiveSite, requestSite } from 'calypso/state/sites/actions';
import { getSite, isRequestingSite } from 'calypso/state/sites/selectors';
import { useFlowState } from '../declarative-flow/internals/state-manager/store';
import { SITE_STORE } from '../stores';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';
import type { SiteSelect } from '@automattic/data-stores';

export function useSite( siteFragment?: number | string ) {
	const dispatch = useDispatch();
	const siteSlug = useSiteSlugParam();
	const siteIdParam = useSiteIdParam();
	const createdSiteID = useFlowState().get( 'site' )?.siteId;
	const siteIdOrSlug = siteFragment || siteIdParam || siteSlug || createdSiteID;

	const { site, siteStoreHasResolved } = useSelect(
		( select ) => {
			const siteStore = select( SITE_STORE ) as SiteSelect;

			return {
				site: siteIdOrSlug ? siteStore.getSite( siteIdOrSlug ) : null,
				siteStoreHasResolved: siteIdOrSlug
					? (
							select( SITE_STORE ) as SiteSelect & {
								hasFinishedResolution: ( selector: string, args: unknown[] ) => boolean;
							}
					   ).hasFinishedResolution( 'getSite', [ siteIdOrSlug ] )
					: false,
			};
		},
		[ siteIdOrSlug ]
	);

	// Sync site data to the Redux store. We let the SITE_STORE resolver be the
	// primary fetch to avoid a redundant network request. Once it resolves, we
	// either sync the data into Redux or fall back to requestSite if the
	// resolver failed.
	useEffect( () => {
		if ( ! siteIdOrSlug || ! siteStoreHasResolved ) {
			return;
		}

		dispatch( ( d, getState ) => {
			const state = getState();
			if ( getSite( state, siteIdOrSlug ) || isRequestingSite( state, siteIdOrSlug ) ) {
				return;
			}

			if ( site ) {
				// SITE_STORE resolved successfully — sync to Redux without a network request.
				d( receiveSite( site ) );
			} else {
				// SITE_STORE resolver failed — fall back to fetching via Redux.
				d( requestSite( siteIdOrSlug ) );
			}
		} );
	}, [ dispatch, siteIdOrSlug, siteStoreHasResolved, site ] );

	if ( siteIdOrSlug && site ) {
		return site;
	}

	return null;
}
