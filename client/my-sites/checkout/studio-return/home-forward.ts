import page, { type Context } from '@automattic/calypso-router';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { buildStudioSyncConnectPath, getStudioSyncConnectParams } from './round-trip';

/**
 * Sends Studio's publish-flow links that still reach `/home/:site` to the sync-connect page: tabs
 * that loaded an older Stepper bundle, and checkouts in flight when the flow's destination changed.
 *
 * It must run before `siteSelection`: every later `/home` middleware can redirect and drop the
 * Studio params.
 */
export function forwardStudioHomeLink( context: Context, next: () => void ): void {
	const { studioSiteId, autoOpenPush } = context.query;
	if ( ! studioSiteId ) {
		next();
		return;
	}

	const syncConnect = getStudioSyncConnectParams( {
		studioSiteId,
		autoOpenPush,
		remoteSiteId: context.params.site,
	} );
	if ( ! syncConnect?.params ) {
		next();
		return;
	}

	recordTracksEvent( 'calypso_studio_sync_home_forward', {
		blog_id: syncConnect.params.remoteSiteId,
	} );
	page.redirect( buildStudioSyncConnectPath( syncConnect.params ) );
}
