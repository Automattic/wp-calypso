import { Store } from 'redux';
import wpcom from 'calypso/lib/wp';
import {
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	ODYSSEY_SITE_RECEIVE,
} from 'calypso/state/action-types';
import { getSite, isRequestingSite } from 'calypso/state/sites/selectors';
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
				http_envelope: ! config.isEnabled( 'is_running_in_jetpack_site' ),
			}
		);

		// For Jetpack/Atomic sites, data format is { data: JSON string of SiteDetails }
		const siteData =
			config.isEnabled( 'is_running_in_jetpack_site' ) && 'data' in data
				? JSON.parse( data.data )
				: data;

		dispatch( { type: ODYSSEY_SITE_RECEIVE, site: siteData } );
		dispatch( { type: SITE_REQUEST_SUCCESS, siteId } );
	} catch ( error ) {
		dispatch( { type: SITE_REQUEST_FAILURE, siteId } );
	}
}
