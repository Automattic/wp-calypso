import { Store } from 'redux';
import { CalypsoDispatch } from 'calypso/state/types';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import config from './config-api';

/**
 * Select the embedded site in the Redux store. Site details themselves are fetched by
 * OdysseyQuerySites, the Odyssey replacement for calypso/components/data/query-sites
 * (see apps/odyssey-stats/webpack.config.js), the same way every other Odyssey data
 * component is wired up, rather than as a separate bootstrap-time fetch here.
 */
export function initializeSiteData( store: Store & { dispatch: CalypsoDispatch } ): void {
	const siteId = config( 'blog_id' );
	store.dispatch( setSelectedSiteId( siteId ) );
}
