import { isError } from '@automattic/js-utils';
import { Store } from 'redux';
import {
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	ODYSSEY_SITE_RECEIVE,
} from 'calypso/state/action-types';
import { getSite } from 'calypso/state/sites/selectors';
import { IAppState, CalypsoDispatch } from 'calypso/state/types';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import config from './config-api';
import { querySite } from './query-site';

/**
 * Select the embedded site and fetch its details before the app renders any route, so
 * components mounted alongside stats-main (e.g. OdysseyQuerySitePurchases, via
 * getEnvStatsFeatureSupportChecks) don't see incomplete site data on their first render.
 * OdysseyQuerySites -- the Odyssey replacement for calypso/components/data/query-sites,
 * mounted by stats-main -- reuses the same querySite fetch and simply no-ops once this has
 * already populated the store.
 */
export async function initializeSiteData(
	store: Store< IAppState > & { dispatch: CalypsoDispatch }
): Promise< void > {
	const siteId = config( 'blog_id' );
	const dispatch = store.dispatch;

	dispatch( setSelectedSiteId( siteId ) );

	const site = getSite( store.getState(), siteId );

	// If options stored on WPCOM already exist, we don't need to fetch it again.
	if ( site?.options && 'is_commercial' in site.options ) {
		return;
	}

	dispatch( { type: SITE_REQUEST, siteId } );

	const siteData = await querySite( siteId );

	if ( isError( siteData ) ) {
		dispatch( { type: SITE_REQUEST_FAILURE, siteId } );
		return;
	}

	dispatch( { type: ODYSSEY_SITE_RECEIVE, site: siteData } );
	dispatch( { type: SITE_REQUEST_SUCCESS, siteId } );
}
