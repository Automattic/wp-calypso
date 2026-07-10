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

interface SimpleSiteSettingsResponse {
	name?: string;
	description?: string;
	settings?: Record< string, unknown >;
}

interface JetpackSiteDetailsResponse {
	name?: string;
	description?: string;
	options?: Record< string, unknown > & { timezone?: string };
}

function querySiteSettings( siteId: SiteId ) {
	// Simple sites already talk to public-api.wordpress.com directly, so keep using
	// the dedicated settings endpoint there.
	if ( ! config.isEnabled( 'is_running_in_jetpack_site' ) ) {
		return wpcom.req
			.get( `/sites/${ siteId }/settings`, { apiVersion: '1.4' } )
			.then( ( { name, description, settings }: SimpleSiteSettingsResponse ) => ( {
				...normalizeSettings( settings ?? {} ),
				blogname: name,
				blogdescription: description,
			} ) )
			.catch( ( error: Error ) => error );
	}

	// Jetpack-connected sites don't have their own `/settings` endpoint on wpcom, so
	// fetch the site details already exposed locally via `jetpack/v4/site` instead.
	return wpcom.req
		.get( { path: '/site', apiNamespace: 'jetpack/v4' } )
		.then( ( res: JetpackSiteDetailsResponse & { data?: string } ) => {
			// The Jetpack REST API wraps the response as `{ data: JSON string of SiteDetails }`.
			const site: JetpackSiteDetailsResponse =
				typeof res?.data === 'string' ? JSON.parse( res.data ) : res;

			return {
				...site.options,
				// `/sites/{id}` reports the timezone under `timezone`, while the rest of the
				// app (e.g. useMomentSiteZone) reads it as `timezone_string`, matching the
				// dedicated `/settings` endpoint's field name.
				timezone_string: site.options?.timezone,
				blogname: site.name,
				blogdescription: site.description,
			};
		} )
		.catch( ( error: Error ) => error );
}

function useQuerySiteSettings( siteId: SiteId ) {
	return useQuery< Record< string, unknown > | Error >( {
		...getDefaultQueryParams(),
		queryKey: [ 'odyssey-stats', 'site-settings', siteId ],
		queryFn: () => querySiteSettings( siteId ),
		retry: false,
	} );
}

/**
 * Update site settings in the Redux store for Odyssey Stats.
 */
export default function OdysseyQuerySiteSettings( { siteId }: { siteId: SiteId } ) {
	const { data: settings, isFetching, isError: hasQueryError } = useQuerySiteSettings( siteId );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! siteId || isFetching ) {
			return;
		}

		dispatch( { type: SITE_SETTINGS_REQUEST, siteId } );

		if ( hasQueryError || isError( settings ) || ! settings ) {
			dispatch( { type: SITE_SETTINGS_REQUEST_FAILURE, siteId, error: true } );
			return;
		}

		dispatch( receiveSiteSettings( siteId, settings ) );
		dispatch( receiveSiteOptions( siteId, settings ) );
		dispatch( { type: SITE_SETTINGS_REQUEST_SUCCESS, siteId } );
	}, [ dispatch, siteId, settings, isFetching, hasQueryError ] );

	return null;
}
