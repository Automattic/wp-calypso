import { Store } from 'redux';
import wpcom from 'calypso/lib/wp';
import {
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	ODYSSEY_SITE_RECEIVE,
} from 'calypso/state/action-types';
import { getSite, getSiteOption, isRequestingSite } from 'calypso/state/sites/selectors';
import { IAppState, CalypsoDispatch } from 'calypso/state/types';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import config from './config-api';
import { getApiNamespace, getApiPath } from './get-api';

/**
 * Initialize site data in the Redux store and fetch site details if needed.
 * This includes setting the selected site and fetching its data from the WordPress.com API.
 */
export async function initializeSiteData(
	store: Store< IAppState > & { dispatch: CalypsoDispatch }
): Promise< void > {
	const siteId = config( 'blog_id' );
	const dispatch = store.dispatch;
	const state = store.getState();

	dispatch( setSelectedSiteId( siteId ) );

	const isRequesting = isRequestingSite( state, siteId );
	const site = getSite( state, siteId );

	// Jetpack-connected sites have no dedicated `/settings` endpoint reachable from here (see
	// OdysseyQuerySiteSettings), so useMomentSiteZone falls back to this fetch's data via
	// getSiteOption instead. `/sites/{id}` reports the timezone under `options.timezone`
	// there, while that fallback reads `options.timezone_string` -- normalize it here too,
	// since the early return below can skip the fetch (and the same normalization further
	// down) when the store was already hydrated with site data before this function ran.
	const isJetpackSite = config.isEnabled( 'is_running_in_jetpack_site' );
	if (
		isJetpackSite &&
		site?.options?.timezone &&
		! getSiteOption( state, siteId, 'timezone_string' )
	) {
		dispatch( {
			type: ODYSSEY_SITE_RECEIVE,
			site: { ID: siteId, options: { timezone_string: site.options.timezone } },
		} );
	}

	// If options stored on WPCOM exists or it's already requesting, we do not need to fetch it again.
	if ( ( site?.options && 'is_commercial' in site.options ) || isRequesting ) {
		return;
	}

	dispatch( { type: SITE_REQUEST, siteId: siteId } );

	try {
		const data = await wpcom.req.get(
			{
				path: getApiPath( '/site', { siteId } ),
				apiNamespace: getApiNamespace(),
			},
			{
				// Only add the http_envelope flag if it's a Simple Classic site.
				http_envelope: ! isJetpackSite,
			}
		);

		// For Jetpack/Atomic sites, data format is { data: JSON string of SiteDetails }
		const siteData = isJetpackSite && 'data' in data ? JSON.parse( data.data ) : data;

		// See the comment above on the same normalization for the pre-hydrated case.
		if ( isJetpackSite && siteData?.options?.timezone && ! siteData.options.timezone_string ) {
			siteData.options.timezone_string = siteData.options.timezone;
		}

		dispatch( { type: ODYSSEY_SITE_RECEIVE, site: siteData } );
		dispatch( { type: SITE_REQUEST_SUCCESS, siteId } );
	} catch ( error ) {
		dispatch( { type: SITE_REQUEST_FAILURE, siteId } );
	}
}
