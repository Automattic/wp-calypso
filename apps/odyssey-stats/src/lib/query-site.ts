import wpcom from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';
import config from './config-api';
import { getApiNamespace, getApiPath } from './get-api';

/**
 * Fetch site details, shared between OdysseyQuerySites (the mounted data component) and
 * initializeSiteData (which awaits this once at app boot so site data is ready before the
 * first route renders, matching what components mounted alongside it -- e.g. purchases via
 * getEnvStatsFeatureSupportChecks -- already assume).
 */
export function querySite( siteId: SiteId ) {
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
