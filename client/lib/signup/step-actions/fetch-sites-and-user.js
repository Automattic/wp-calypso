/**
 * Internal dependencies
 */
import user from 'calypso/lib/user';

// State actions and selectors
import { getSiteId } from 'calypso/state/sites/selectors';
import { requestSites } from 'calypso/state/sites/actions';

async function fetchSitesUntilSiteAppears( siteSlug, reduxStore ) {
	while ( ! getSiteId( reduxStore.getState(), siteSlug ) ) {
		await reduxStore.dispatch( requestSites() );
	}
}

export function fetchSitesAndUser( siteSlug, onComplete, reduxStore ) {
	Promise.all( [ fetchSitesUntilSiteAppears( siteSlug, reduxStore ), user().fetch() ] ).then(
		onComplete
	);
}
