import { useDispatch as useStoreDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { getSite, isRequestingSite } from 'calypso/state/sites/selectors';
import { useFlowState } from '../declarative-flow/internals/state-manager/store';
import { SITE_STORE } from '../stores';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';
import type { SiteSelect } from '@automattic/data-stores';
import type { CurriedSelectorsOf, StoreDescriptor } from '@wordpress/data';

export function useSite( siteFragment?: number | string ) {
	return useSiteDetails( siteFragment ).data;
}

export function useSiteDetails( siteFragment?: number | string ) {
	const dispatch = useDispatch();
	const { invalidateResolution } = useStoreDispatch( SITE_STORE );
	const siteSlug = useSiteSlugParam();
	const siteIdParam = useSiteIdParam();
	const createdSiteID = useFlowState().get( 'site' )?.siteId;
	const siteIdOrSlug = siteFragment || siteIdParam || siteSlug || createdSiteID;

	const { data, hasResolved } = useSelect(
		( select ) => {
			const siteStore = select( SITE_STORE ) as SiteSelect &
				Pick< CurriedSelectorsOf< StoreDescriptor >, 'hasFinishedResolution' >;

			return {
				data: ( siteIdOrSlug && siteStore.getSite( siteIdOrSlug ) ) || null,
				hasResolved:
					!! siteIdOrSlug && siteStore.hasFinishedResolution( 'getSite', [ siteIdOrSlug ] ),
			};
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

	const refetch = useCallback(
		() => invalidateResolution( 'getSite', [ siteIdOrSlug ] ),
		[ invalidateResolution, siteIdOrSlug ]
	);

	return {
		data,
		isLoading: !! siteIdOrSlug && ! data && ! hasResolved,
		isError: !! siteIdOrSlug && ! data && hasResolved,
		refetch: siteIdOrSlug ? refetch : undefined,
	};
}
