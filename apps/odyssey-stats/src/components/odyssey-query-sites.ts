/**
 * This is a Odyssey implementation of 'calypso/components/data/query-sites'.
 */
import { isError } from '@automattic/js-utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import { useSelector } from 'calypso/state';
import {
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	ODYSSEY_SITE_RECEIVE,
} from 'calypso/state/action-types';
import { getSite } from 'calypso/state/sites/selectors';
import { SiteId } from 'calypso/types';
import config from '../lib/config-api';
import { getApiNamespace, getApiPath } from '../lib/get-api';

function querySite( siteId: SiteId ) {
	return wpcom.req
		.get(
			{
				path: getApiPath( '/site', { siteId } ),
				apiNamespace: getApiNamespace(),
			},
			{
				// Only add the http_envelope flag if it's a Simple Classic site.
				http_envelope: ! config.isEnabled( 'is_running_in_jetpack_site' ),
			}
		)
		.then( ( data: { data?: string } ) =>
			// For Jetpack/Atomic sites, data format is { data: JSON string of SiteDetails }
			config.isEnabled( 'is_running_in_jetpack_site' ) && 'data' in data
				? JSON.parse( data.data as string )
				: data
		)
		.catch( ( error: Error ) => error );
}

function useQuerySite( siteId: SiteId, enabled: boolean ) {
	return useQuery< Record< string, unknown > | Error >( {
		...getDefaultQueryParams(),
		queryKey: [ 'odyssey-stats', 'site', siteId ],
		queryFn: () => querySite( siteId ),
		retry: false,
		enabled,
	} );
}

/**
 * Fetch site details in the Redux store for Odyssey Stats.
 */
export default function OdysseyQuerySites( { siteId }: { siteId: SiteId } ) {
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	// If options stored on WPCOM already exist, we don't need to fetch it again. Deliberately
	// not gating on isRequestingSite here -- this component is the only thing that dispatches
	// SITE_REQUEST, so reading it back into this same enabled/effect condition would create a
	// feedback loop that disables the query mid-fetch.
	const alreadyHydrated = !! ( site?.options && 'is_commercial' in site.options );
	const shouldFetch = ! alreadyHydrated && !! siteId;

	const {
		data: siteData,
		isFetching,
		isError: hasQueryError,
	} = useQuerySite( siteId, shouldFetch );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! shouldFetch ) {
			return;
		}

		if ( isFetching ) {
			dispatch( { type: SITE_REQUEST, siteId } );
			return;
		}

		if ( hasQueryError || isError( siteData ) || ! siteData ) {
			dispatch( { type: SITE_REQUEST_FAILURE, siteId } );
			return;
		}

		dispatch( { type: ODYSSEY_SITE_RECEIVE, site: siteData } );
		dispatch( { type: SITE_REQUEST_SUCCESS, siteId } );
	}, [ dispatch, shouldFetch, siteId, siteData, isFetching, hasQueryError ] );

	return null;
}
