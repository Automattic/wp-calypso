/**
 * This is a Odyssey implementation of 'calypso/components/data/query-site-settings'.
 */
import config from '@automattic/calypso-config';
import { isError } from '@automattic/js-utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import { useDispatch } from 'calypso/state';
import {
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_REQUEST_FAILURE,
	SITE_SETTINGS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { receiveSiteOptions, receiveSiteSettings } from 'calypso/state/site-settings/actions';
import { normalizeSettings } from 'calypso/state/site-settings/utils';
import { SiteId } from 'calypso/types';

interface SiteSettingsResponse {
	name?: string;
	description?: string;
	settings?: Record< string, unknown >;
}

function querySiteSettings( siteId: SiteId ) {
	return wpcom.req
		.get( `/sites/${ siteId }/settings`, { apiVersion: '1.4' } )
		.then( ( { name, description, settings }: SiteSettingsResponse ) => ( {
			...normalizeSettings( settings ?? {} ),
			blogname: name,
			blogdescription: description,
		} ) )
		.catch( ( error: Error ) => error );
}

function useQuerySiteSettings( siteId: SiteId, enabled: boolean ) {
	return useQuery< Record< string, unknown > | Error >( {
		...getDefaultQueryParams(),
		queryKey: [ 'odyssey-stats', 'site-settings', siteId ],
		queryFn: () => querySiteSettings( siteId ),
		retry: false,
		enabled,
	} );
}

/**
 * Update site settings in the Redux store for Odyssey Stats.
 *
 * Simple sites still use the dedicated `/sites/{id}/settings` endpoint directly, same as
 * Calypso. Jetpack-connected sites don't need it: `initializeSiteData` already fetches
 * `jetpack/v4/site` at startup and normalizes its `timezone` field into `timezone_string`
 * (see apps/odyssey-stats/src/lib/initialize-site-data.ts), which is the only data Stats
 * actually reads from this endpoint (via useMomentSiteZone's getSiteOption fallback). The
 * dedicated settings endpoint isn't reachable from an embedded Jetpack site anyway —
 * `jetpack_site_xhr_wrapper` reroutes any non-local apiNamespace to `jetpack/v4/stats-app`,
 * which has no matching route.
 */
export default function OdysseyQuerySiteSettings( { siteId }: { siteId: SiteId } ) {
	const isJetpackSite = config.isEnabled( 'is_running_in_jetpack_site' );
	const {
		data: settings,
		isFetching,
		isError: hasQueryError,
	} = useQuerySiteSettings( siteId, ! isJetpackSite && !! siteId );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( isJetpackSite || ! siteId ) {
			return;
		}

		if ( isFetching ) {
			dispatch( { type: SITE_SETTINGS_REQUEST, siteId } );
			return;
		}

		if ( hasQueryError || isError( settings ) || ! settings ) {
			dispatch( { type: SITE_SETTINGS_REQUEST_FAILURE, siteId, error: true } );
			return;
		}

		dispatch( receiveSiteSettings( siteId, settings ) );
		dispatch( receiveSiteOptions( siteId, settings ) );
		dispatch( { type: SITE_SETTINGS_REQUEST_SUCCESS, siteId } );
	}, [ dispatch, isJetpackSite, siteId, settings, isFetching, hasQueryError ] );

	return null;
}
