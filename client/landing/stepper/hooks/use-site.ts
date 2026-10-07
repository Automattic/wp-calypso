import { useDispatch as useStoreDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { getSite, isRequestingSite } from 'calypso/state/sites/selectors';
import { useFlowState } from '../declarative-flow/internals/state-manager/store';
import { SITE_STORE } from '../stores';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';

export function useSite( siteFragment?: number | string ) {
	return useSiteQuery( siteFragment ).data;
}

export function useSiteQuery( siteFragment?: number | string ) {
	const dispatch = useDispatch();
	const { invalidateResolution } = useStoreDispatch( SITE_STORE );
	const siteSlug = useSiteSlugParam();
	const siteIdParam = useSiteIdParam();
	const createdSiteID = useFlowState().get( 'site' )?.siteId;
	const siteIdOrSlug = siteFragment || siteIdParam || siteSlug || createdSiteID;

	const { data, hasResolved } = useSelect(
		( select ) => {
			const siteStore = select( SITE_STORE );

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

	const refetch = useCallback( () => {
		if ( ! siteIdOrSlug ) {
			return;
		}
		invalidateResolution( 'getSite', [ siteIdOrSlug ] );
		dispatch( ( d, getState ) => {
			if ( ! isRequestingSite( getState(), siteIdOrSlug ) ) {
				d( requestSite( siteIdOrSlug ) );
			}
		} );
	}, [ dispatch, invalidateResolution, siteIdOrSlug ] );

	return {
		data,
		isLoading: !! siteIdOrSlug && ! data && ! hasResolved,
		isError: !! siteIdOrSlug && ! data && hasResolved,
		refetch,
	};
}
